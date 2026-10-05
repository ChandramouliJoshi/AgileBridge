
import { ArrowRight, Check, LogIn, Pencil, Users, CheckCircle, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';


const features = [
  {
    title: 'AI-Powered Suggestions',
    description: 'Leverage artificial intelligence to generate user stories, suggest task breakdowns, and identify potential risks in your project.',
  },
  {
    title: 'Interactive Kanban Board',
    description: 'Visualize your workflow with a drag-and-drop Kanban board. Easily move tasks between columns to track progress from "To Do" to "Done".',
  },
  {
    title: 'Real-Time Collaboration',
    description: 'Work seamlessly with your team. Get instant notifications on task updates, assignments, and comments.',
  },
  {
    title: 'Project & Role Management',
    description: 'Organize your work into projects, assign roles to team members, and manage permissions with a powerful admin dashboard.',
  },
  {
    title: 'Detailed Analytics',
    description: 'Gain insights into your team\'s performance with charts and metrics on task completion, time tracking, and workload distribution.',
  },
  {
    title: 'Customizable Profiles',
    description: 'Personalize your user profile with your designation, university, bio, and more to share your role and expertise with the team.',
  },
];

const steps = [
  {
    icon: <LogIn className="h-8 w-8 text-primary" />,
    title: '1. Sign Up & Create Your Profile',
    description: 'Join AgileBridge by creating an account. Fill out your profile to let your team know who you are and what your role is.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: '2. Create or Join a Project',
    description: 'Start a new project or get invited to an existing one. Admins can easily manage team members and their roles.',
  },
  {
    icon: <Pencil className="h-8 w-8 text-primary" />,
    title: '3. Add and Assign Tasks',
    description: 'Break down your project into tasks. Add details, set priorities, and assign them to the appropriate team members.',
  },
  {
    icon: <ArrowRight className="h-8 w-8 text-primary" />,
    title: '4. Track Progress on the Board',
    description: 'Use the Kanban board to visualize your workflow. Drag and drop tasks to update their status and keep everyone in the loop.',
  },
];


export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold transition-transform duration-300 hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-primary"
          >
            <path d="M12 3L4 9V17H20V9L12 3Z" />
            <path d="M8 21V15H16V21" />
            <path d="M10 11H14" />
          </svg>
          <span className="font-bold">AgileBridge</span>
        </Link>
        <div className="flex items-center gap-4">
          
        </div>
      </header>
      <main className="flex-1">
        <section className="relative py-12 md:py-24 lg:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 top-0 -z-10 h-full w-full bg-gradient-to-b from-primary/10 to-background"
          />
          <div className="container px-8 md:px-12 lg:px-16">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
              <div className="flex flex-col justify-center space-y-8 animate-fade-in-right">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Streamline Your Project <br />
                    <span className="text-primary">Workflow</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    AgileBridge is the ultimate project management tool for
                    modern teams. Track tasks, collaborate seamlessly, and ship
                    projects faster than ever before.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Get Started <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/login">
                      Sign In
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>AI-Powered Suggestions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Drag & Drop Board</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Team Collaboration</span>
                  </div>
                </div>
              </div>

              <div className="relative isolate flex items-center justify-center animate-fade-in-left">
                <Image
                  src="https://images.unsplash.com/photo-1549492423-400259a2e574?q=80&w=800&auto=format&fit=crop"
                  width={800}
                  height={533}
                  alt="Misty meadow"
                  data-ai-hint="misty meadow"
                  className="mx-auto aspect-video max-w-full overflow-hidden rounded-xl object-cover object-center shadow-2xl"
                />

                <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 pointer-events-none">
                   <div className="inline-flex items-center rounded-lg border p-3 shadow-lg border-border/50 bg-background/80 backdrop-blur-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-primary/70"
                      >
                        <path d="M12 3L4 9V17H20V9L12 3Z" />
                        <path d="M8 21V15H16V21" />
                      </svg>
                    </div>
                </div>


                <div className="absolute top-1/4 right-0 transform translate-x-1/4 -translate-y-1/2 transition-transform duration-300 hover:scale-110">
                   <div className="inline-flex items-center rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2  p-3 shadow-lg border-border/50 bg-background/80 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                        Active Users
                        <span className="ml-4 text-xl font-bold">50</span>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 transform -translate-x-1/4 translate-y-1/4 transition-transform duration-300 hover:scale-110">
                   <div className="inline-flex items-center rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-3 shadow-lg border-border/50 bg-background/80 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Projects Completed
                        <span className="ml-4 text-xl font-bold">20</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 md:py-24 lg:py-32 bg-muted/30">
            <div className="container px-8 md:px-12 lg:px-16">
                <div className="mx-auto max-w-3xl text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                        Features of <span className="text-primary">AgileBridge</span>
                    </h2>
                    <p className="text-muted-foreground md:text-xl">
                        Everything you need to manage your projects, collaborate with your team, and ship faster.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="hover:shadow-primary/20 hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <CheckCircle className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
        
        <section id="how-it-works" className="py-20 md:py-24 lg:py-32">
            <div className="container px-8 md:px-12 lg:px-16">
                <div className="mx-auto max-w-3xl text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                        How <span className="text-primary">AgileBridge</span> Works
                    </h2>
                    <p className="text-muted-foreground md:text-xl">
                        A simple and intuitive process to get your projects moving from idea to launch.
                    </p>
                </div>

                <div className="mt-16 max-w-4xl mx-auto space-y-8">
                    {steps.map((step, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                                        {step.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{step.title}</CardTitle>
                                        <p className="text-muted-foreground mt-1">{step.description}</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section id="contact" className="py-20 md:py-24 lg:py-32 bg-muted/30">
            <div className="container px-8 md:px-12 lg:px-16">
                <div className="mx-auto max-w-3xl text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                        Get in Touch
                    </h2>
                    <p className="text-muted-foreground mdTtext-xl">
                        Have questions or want to learn more? Send us a message.
                    </p>
                </div>
                <div className="mt-12 max-w-xl mx-auto">
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Enter your name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Enter your email" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Enter your message" className="min-h-[120px]" />
                        </div>
                        <div className="flex justify-center">
                            <Button asChild>
                                <a href="mailto:agilebridge25@gmail.com">Send Message</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

      </main>
      <footer className="flex items-center justify-center py-6 px-4 md:px-6 border-t border-border/40">
        <div className="container flex items-center justify-between">
            <p className="text-sm text-muted-foreground">&copy; 2025 AgileBridge. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
