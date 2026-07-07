export const metadata = {
  title: "TinyTales AI",
  description: "Big ideas explained in tiny words.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, height: "100vh" }}>{children}</body>
    </html>
  );
}
