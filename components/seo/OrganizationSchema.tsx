import JsonLd from '@/components/JsonLd'
import { getOrganizationSchema } from '@/lib/seo-utils'

export default function OrganizationSchema() {
  return <JsonLd data={getOrganizationSchema()} />
}
