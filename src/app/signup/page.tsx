
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { PasswordStrength } from '@/components/password-strength';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Role } from '@/lib/types';

const availableRoles: Role[] = ['Frontend', 'Backend', 'Developer'];

export default function SignupPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<Role | ''>('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { addUser, allUsers } = useAuth();


    const passwordChecks = useMemo(() => {
        const checks = [
            { label: 'At least 8 characters', valid: password.length >= 8 },
            { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
            { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
            { label: 'One number', valid: /[0-9]/.test(password) },
            { label: 'One special character', valid: /[^A-Za-z0-9]/.test(password) },
        ];
        return checks;
    }, [password]);

    const allChecksValid = passwordChecks.every(c => c.valid);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedUsername = username.trim();
        const forbiddenUsernames = ['admin', 'manager'];
        if (forbiddenUsernames.includes(trimmedUsername.toLowerCase())) {
            toast({ variant: 'destructive', title: 'Invalid Username', description: `The username "${trimmedUsername}" is not allowed.` });
            return;
        }

        const usernameExists = allUsers.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
        if(usernameExists) {
            toast({ variant: 'destructive', title: 'Username Taken', description: 'This username is already in use. Please choose another.' });
            return;
        }


        if (!role) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a role.' });
            return;
        }

        if (password !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
            return;
        }

        if (!allChecksValid) {
            toast({ variant: 'destructive', title: 'Error', description: 'Password does not meet the requirements.' });
            return;
        }

        try {
            addUser({ username, email, role, password });
            setSignupSuccess(true);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
        }
    };

    if (signupSuccess) {
        return (
             <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
                <Card className="w-full max-w-md shadow-lg text-center">
                    <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="text-2xl">Registration Successful</CardTitle>
                        <CardDescription>
                           Your account has been created and is now pending approval from an administrator. You will be notified via email once your account is activated.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                           <Link href="/">Return to Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
            <Link href="/" className="absolute top-4 left-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
            </Link>
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mb-4 inline-block mx-auto">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-10 w-10 text-primary"
                        >
                            <path d="M12 3L4 9V17H20V9L12 3Z" />
                            <path d="M8 21V15H16V21" />
                            <path d="M10 11H14" />
                        </svg>
                    </div>
                    <CardTitle className="text-2xl">Create your account</CardTitle>
                    <CardDescription>Join AgileBridge and start managing your projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="role">Choose your role</Label>
                            <Select onValueChange={(value: Role) => setRole(value)} value={role}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map(r => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsPasswordFocused(true)}
                                    required 
                                />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                             <div className="relative">
                                <Input 
                                    id="confirm-password" 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required 
                                />
                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                                </Button>
                            </div>
                        </div>

                        {isPasswordFocused && (
                            <div className="mt-2">
                                <PasswordStrength checks={passwordChecks} />
                            </div>
                        )}
                        
                        <Button type="submit" className="w-full mt-2">Create account</Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
