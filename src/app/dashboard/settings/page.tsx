import { ProfileCard } from "@/components/settings/profile-card";
import { EditProfileForm } from "@/components/settings/edit-profile-form";

export default function SettingsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Personal Information</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <ProfileCard />
                </div>
                <div className="lg:col-span-2">
                    <EditProfileForm />
                </div>
            </div>
        </div>
    );
}
