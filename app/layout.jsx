import './globals.css'

export const metadata = {
  title: 'GitRoast - Get Your GitHub Roasted Seinfeld Style',
  description: 'Enter your GitHub username and get hilariously roasted in classic Seinfeld observational comedy style',
  keywords: 'github, roast, comedy, seinfeld, developer, programming',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
