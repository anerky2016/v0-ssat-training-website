import { Metadata } from "next"
import dynamicImport from "next/dynamic"

export const metadata: Metadata = {
  title: "E-Reader | SSAT Training",
  description: "Read PDF and EPUB files with built-in vocabulary support",
}

export const dynamic = "force-dynamic"

const EReaderClient = dynamicImport(
  () => import("@/components/e-reader-client").then((mod) => mod.EReaderClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading E-Reader...</p>
        </div>
      </div>
    )
  }
)

export default function EReaderPage() {
  return <EReaderClient />
}
