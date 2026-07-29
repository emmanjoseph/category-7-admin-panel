export default function HotspotLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="min-h-screen bg-black text-white antialiased">
        {children}
        </body>
        </html>
    )
}