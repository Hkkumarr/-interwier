export function checkNode() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 24 || (major === 24 && minor < 5)) {
    console.error(`Node.js 24.5+ is required; found ${process.version}. Install Node.js 24 LTS and retry.`);
    process.exit(1);
  }
}
