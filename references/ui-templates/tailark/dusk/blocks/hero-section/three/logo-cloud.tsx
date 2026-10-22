// Source: tailark/blocks@8139698 registry/bases/base/dusk/blocks/hero-section/three/logo-cloud.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Spotify } from '@/registry/core/ui/svgs/spotify'
import { VercelFull } from '@/registry/core/ui/svgs/vercel'
import { SupabaseFull } from '@/registry/core/ui/svgs/supabase'
import { Hulu } from '@/registry/core/ui/svgs/hulu'
import { Bolt } from '@/registry/core/ui/svgs/bolt'
import { Beacon } from '@/registry/core/ui/svgs/beacon'

export const LogoCloud = () => {
    return (
        <div className="**:fill-muted-foreground relative mt-24 flex flex-wrap items-center justify-center gap-8 md:gap-x-16">
            <Bolt
                height={22}
                width={54}
            />
            <VercelFull
                height={22}
                width={84}
            />
            <SupabaseFull className="h-6" />
            <Hulu
                height={18}
                width={56}
            />
            <Spotify
                height={26}
                width={84}
            />
            <Beacon
                height={24}
                width={80}
            />
        </div>
    )
}
