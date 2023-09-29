# CabraPing Frontend

Social pong game with chat.

Check out <https://cabraping.vercel.app>

## Features

- [x] Discover people to chat and challenge in a pong game

## Tech Stack

1. [TypeScript](https://typescriptlang.org): Typed language
   - Related to JavaScript, HTML, CSS
2. [React](https://react.dev): UI library
3. [Vite](https://vitejs.org): Bundler
   - [React Router](https://reactrouter.com): Routing
4. [Tailwind CSS](https://tailwindcss.com): Styling
5. [Radix UI](https://radix-ui.com): Interactive components
   - [shadcn UI](https://ui.shadcn.com): Styled interactive components
   - [Tabler Icons](https://tabler-icons.io): Icon set
6. [Vercel](https://vercel.com): App deployment

## Setup

### Environment Variables

Create the .env file from the example .env file.

```sh
cp -i .env.example .env
```

> This .env file is only for local development, not production

Configure the required environment variables in the .env file if local,
otherwise in the project settings, for:

- `BACKEND_URL`

## Development

### Dependencies

Use [pnpm](https://pnpm.io) to improve productivity and replace npm. It's faster and more efficient. So make
sure [pnpm is installed](https://pnpm.io/installation#using-npm):

```sh
npm i -g pnpm
```

To run the app locally, make sure the project's local dependencies are
installed:

```sh
pnpm install
```

### Build

Check if the build is fine:

```sh
pnpm build
```

### Develop Locally

If everything works fine, start the development server like so:

```sh
pnpm dev
```

Open up [http://localhost:5173](http://localhost:5173) and it should be ready to
go!