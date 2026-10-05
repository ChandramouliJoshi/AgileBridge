const { chromium } = require('playwright');
const http = require('http');
const { promises: fs } = require('fs');
const path = require('path');

// Helper: fetch raw HTML from URL (server-rendered version)
async function fetchServerHTML(url, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1}/${retries}: Fetching from URL: ${url}`);
            const result = await new Promise((resolve, reject) => {
                const req = http.get(url, (res) => {
                    console.log(`Response status: ${res.statusCode}`);
                    let data = '';
                    res.on('data', chunk => {
                        data += chunk;
                        console.log('Received data chunk...');
                    });
                    res.on('end', () => {
                        console.log('Response complete');
                        resolve(data);
                    });
                    res.on('error', (err) => {
                        console.error('Response error:', err);
                        reject(err);
                    });
                });
                
                req.on('error', (err) => {
                    console.error(`Request error (attempt ${i + 1}):`, err);
                    reject(err);
                });
                
                // Set a timeout
                req.setTimeout(5000, () => {
                    req.destroy();
                    reject(new Error('Request timed out after 5s'));
                });
            });
            
            return result;
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Attempt failed, waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('All retry attempts failed');
}

// Helper: Extract input elements and their attributes from HTML string
function parseInputs(html) {
    const inputs = [];
    const regex = /<input[^>]+>/g;
    const matches = html.match(regex) || [];
    
    for (const input of matches) {
        const attrs = {};
        const attrRegex = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))+.)["']?/g;
        let match;
        while ((match = attrRegex.exec(input)) !== null) {
            attrs[match[1]] = match[2];
        }
        inputs.push(attrs);
    }
    return inputs;
}

async function main() {
    // Use the port configured in package.json
    const port = 9002;
    const url = `http://localhost:${port}`;
    
    console.log('Fetching server-rendered HTML...');
    const serverHTML = await fetchServerHTML(url);
    const serverInputs = parseInputs(serverHTML);
    
    console.log('Launching headless browser...');
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate and wait for hydration
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    // Additional wait to ensure hydration completes
    await page.waitForTimeout(2000);
    
    console.log('Extracting hydrated DOM inputs...');
    const hydratedInputs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('input')).map(input => {
            const attrs = {};
            for (const attr of input.attributes) {
                attrs[attr.name] = attr.value;
            }
            return attrs;
        });
    });
    
    console.log('\nComparing server vs hydrated inputs:');
    console.log('===================================');
    
    // Compare inputs and their attributes
    const allInputs = new Set([...serverInputs, ...hydratedInputs]);
    for (const input of allInputs) {
        const serverInput = serverInputs.find(i => i.id === input.id);
        const hydratedInput = hydratedInputs.find(i => i.id === input.id);
        
        if (!serverInput || !hydratedInput) {
            console.log(`\nInput ${input.id || '[no id]'}:`);
            console.log('  Only present in:', !serverInput ? 'hydrated DOM' : 'server HTML');
            continue;
        }
        
        // Find attribute differences
        const allAttrs = new Set([
            ...Object.keys(serverInput),
            ...Object.keys(hydratedInput)
        ]);
        
        let hasDiff = false;
        const diffs = [];
        
        for (const attr of allAttrs) {
            const serverVal = serverInput[attr];
            const hydratedVal = hydratedInput[attr];
            
            if (serverVal !== hydratedVal) {
                hasDiff = true;
                diffs.push({
                    attr,
                    server: serverVal || '[not set]',
                    hydrated: hydratedVal || '[not set]'
                });
            }
        }
        
        if (hasDiff) {
            console.log(`\nInput ${input.id || '[no id]'}:`);
            for (const diff of diffs) {
                console.log(`  ${diff.attr}:`);
                console.log(`    Server:   ${diff.server}`);
                console.log(`    Hydrated: ${diff.hydrated}`);
            }
        }
    }
    
    await browser.close();
    process.exit(0);
}

main().catch(error => {
    console.error('Fatal error:', error);
    if (error.code === 'ECONNREFUSED') {
        console.error('\nTroubleshooting tips:');
        console.error('1. Make sure the Next.js dev server is running on port 9002');
        console.error('2. Try accessing http://localhost:9002 in your browser');
        console.error('3. Check if there are any firewall issues');
    }
    process.exit(1);
});