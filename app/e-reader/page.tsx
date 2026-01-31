import { Metadata } from "next"
import dynamicImport from "next/dynamic"

export const metadata: Metadata = {
  title: "E-Reader | SSAT Training",
  description: "Read PDF and EPUB files with built-in vocabulary support",
}

export const dynamic = "force-dynamic"

const EReaderClient = dynamicImport(
  () => import("@/components/e-reader-client").then((mod) => mod.EReaderClient),
  { ssr: false }
)

export default function EReaderPage() {
  return <EReaderClient />
}
