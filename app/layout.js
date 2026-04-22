export const metadata = {
  title: "Daily Growth",
  description: "英语朗读 · 灵修笔记",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
