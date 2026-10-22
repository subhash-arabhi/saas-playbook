// Source: tailark/blocks@8139698 registry/bases/base/dusk/blocks/call-to-action/two.tsx (MIT). Changes: this comment only. Reference copy, not built: adapt it as .agents/references/ui-templates/README.md says.
import { Button } from '@/registry/bases/base/dusk/ui/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-6">
                <div className="flex items-center justify-center gap-6 max-lg:flex-col max-lg:text-center lg:items-end lg:justify-between">
                    <h2 className="max-w-4xl text-balance text-5xl font-semibold tracking-tight xl:text-6xl">Start building from here</h2>

                    <Button
                        size="lg"
                        nativeButton={false}
                        render={<Link href="#">Get Started</Link>}
                    />
                </div>
            </div>
        </section>
    )
}
