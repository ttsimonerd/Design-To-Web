## Packages
react-dropzone | Drag and drop file uploads
framer-motion | Smooth animations and glassmorphism panel transitions
lucide-react | Icons for the interface
react-resizable-panels | 3-panel VS Code style layout
clsx | Utility for constructing className strings
tailwind-merge | Utility for merging tailwind classes

## Notes
- Expects a backend with a `/ws` WebSocket endpoint emitting `{ "type": "status", "data": { "message": "..." } }` and `{ "type": "preview_ready", "data": { "uuid": "..." } }`
- Expects an iframe-ready endpoint at `/preview/:id`
- Upload uses `multipart/form-data` with a `file` key
- Export triggers a direct navigation to `/api/export/:id`
- App styling is purely dark mode (glassmorphism theme)
