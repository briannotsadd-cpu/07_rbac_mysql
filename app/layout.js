import "./style.css";

export const metadata = {
  title: "RBAC Demo",
  description: "DIT205 RBAC with Next.js and MySQL",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
