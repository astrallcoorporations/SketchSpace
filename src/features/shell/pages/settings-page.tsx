import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { TagInput } from '@/components/shared/tag-input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from '@/lib/auth'
import { useOwnProfile } from '@/features/profile/hooks/use-own-profile'
import { updateProfile, uploadAvatar, uploadBanner } from '@/features/profile/api'
import { AvatarUpload } from '@/features/profile/components/avatar-upload'
import { BannerUpload } from '@/features/profile/components/banner-upload'
import { SocialLinksEditor } from '@/features/profile/components/social-links-editor'
import { AccentColorPicker } from '@/features/profile/components/accent-color-picker'
import type { SocialLink } from '@/features/profile/types'

function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is SocialLink =>
      typeof item === 'object' && item !== null && 'label' in item && 'url' in item,
  )
}

export function SettingsPage() {
  const { user } = useAuth()
  const { profile, loading, setProfile } = useOwnProfile()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [mediums, setMediums] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [accentColor, setAccentColor] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setUsername(profile.username)
    setDisplayName(profile.display_name ?? '')
    setBio(profile.bio ?? '')
    setMediums(profile.favorite_mediums)
    setSkills(profile.skills)
    setSocialLinks(parseSocialLinks(profile.social_links))
    setAccentColor(profile.accent_color)
  }, [profile])

  if (loading || !profile || !user) {
    return (
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <Skeleton className="h-7 w-28" />
        <div className="mt-6 rounded-2xl border border-border p-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="-mt-10 ml-2 size-20 rounded-full border-4 border-background" />
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="mt-4 h-20 w-full" />
        </div>
      </div>
    )
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    try {
      const updated = await updateProfile(user.id, {
        username,
        display_name: displayName || null,
        bio: bio || null,
        favorite_mediums: mediums,
        skills,
        social_links: socialLinks.filter((l) => l.label && l.url),
        accent_color: accentColor,
      })
      setProfile(updated)
      toast.success('Profile updated.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-medium">Settings</h1>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BannerUpload
            bannerUrl={profile.banner_url}
            onUpload={async (file) => {
              const updated = await uploadBanner(user.id, file)
              setProfile(updated)
            }}
          />

          <div className="-mt-14 ml-2">
            <AvatarUpload
              avatarUrl={profile.avatar_url}
              fallback={profile.username[0]?.toUpperCase() ?? '?'}
              onUpload={async (file) => {
                const updated = await uploadAvatar(user.id, file)
                setProfile(updated)
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Favorite mediums</Label>
            <TagInput value={mediums} onChange={setMediums} placeholder="Oil painting, 3D…" />
          </div>

          <div className="space-y-2">
            <Label>Skills</Label>
            <TagInput value={skills} onChange={setSkills} placeholder="Perspective, color theory…" />
          </div>

          <div className="space-y-2">
            <Label>Social links</Label>
            <SocialLinksEditor value={socialLinks} onChange={setSocialLinks} />
          </div>

          <div className="space-y-2">
            <Label>Accent color</Label>
            <p className="text-xs text-muted-foreground">
              Tints your public profile page — the rest of SketchSpace stays as-is.
            </p>
            <AccentColorPicker value={accentColor} onChange={setAccentColor} />
          </div>

          <Button variant="brand" disabled={saving || !username.trim()} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Separator />
          <Button variant="outline" onClick={() => signOut()}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
