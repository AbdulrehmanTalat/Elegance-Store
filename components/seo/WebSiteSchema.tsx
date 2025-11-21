import JsonLd from '@/components/JsonLd'
import { getWebSiteSchema } from '@/lib/seo-utils'

export default function WebSiteSchema() {
  return <JsonLd data={getWebSiteSchema()} />
}
