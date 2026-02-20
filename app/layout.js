export const metadata = {
  title: "AI UGC Ad Generator",
  description: "Generate UGC style vertical ads from one image and a prompt."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, Arial, sans-serif', background: '#0f172a' }}>{children}</body>
    </html>
  );
}
