import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar, Badge } from '@/components/ui/Badge';
import { userService } from '@/services/userService';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name, bio: user?.bio || '' },
  });

  if (!user) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(String(user.id));
    toast.success('User ID copied to clipboard');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('bio', data.bio);
      if (avatarFile) formData.append('avatar', avatarFile);

      const updated = await userService.updateProfile(formData);
      setUser(updated);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account information" />

      <Card className="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar name={user.name} url={previewUrl || user.avatar_url} size={64} />
              <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white">
                <Camera className="h-3.5 w-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setAvatarFile(f);
                      setPreviewUrl(URL.createObjectURL(f));
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge color="brand">{user.role}</Badge>
                {user.is_verified ? (
                  <Badge color="green">Verified</Badge>
                ) : (
                  <Badge color="yellow">Unverified</Badge>
                )}
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-1 rounded-lg px-1.5 py-0.5 font-mono text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  title="Copy your user ID"
                >
                  ID #{user.id} <Copy className="h-3 w-3" />
                </button>
              </div>
              {user.role === 'student' && (
                <p className="mt-1.5 text-xs text-gray-400">
                  Share this ID with your teacher so they can enroll you in a subject.
                </p>
              )}
            </div>
          </div>

          <Input label="Full name" {...register('name', { required: true })} />
          <TextArea
            label="Bio"
            placeholder="Tell us a little about yourself"
            {...register('bio')}
          />

          <Button type="submit" isLoading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
