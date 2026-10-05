'use client';
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordCheck = {
    label: string;
    valid: boolean;
};

type PasswordStrengthProps = {
    checks: PasswordCheck[];
};

export function PasswordStrength({ checks }: PasswordStrengthProps) {
    const validChecks = checks.filter(c => c.valid).length;
    const strength = (validChecks / checks.length) * 100;

    let progressColor = "bg-destructive";
    if (strength > 66) {
        progressColor = "bg-green-500";
    } else if (strength > 33) {
        progressColor = "bg-yellow-500";
    }

    return (
        <div className="space-y-2">
            <Progress value={strength} className="h-2 [&>div]:bg-primary" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {checks.map((check, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {check.valid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={cn("text-muted-foreground", check.valid && "text-foreground")}>
                            {check.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
