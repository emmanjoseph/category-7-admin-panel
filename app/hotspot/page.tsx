import { HotspotPurchaseFlow } from "./hotspot-purchase-flow"

export default async function HotspotPage({
                                              searchParams,
                                          }: {
    searchParams: Promise<{ site?: string; mac?: string; ip?: string; link_login?: string }>
}) {
    const params = await searchParams

    return (
        <HotspotPurchaseFlow
            siteId={params.site ?? null}
            mac={params.mac ?? null}
            deviceIp={params.ip ?? null}
            mikrotikLoginUrl={params.link_login ?? null}
        />
    )
}