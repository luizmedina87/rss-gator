# gator

gator is a command-line RSS feed aggregator backed by PostgreSQL.

Run every command below from the project directory.

## 1. Install Node.js

Install Node.js 22.15.0 with `nvm`:

```bash
nvm install
nvm use
npm ci
```

## 2. Install and start PostgreSQL

Install PostgreSQL with Homebrew, start it, and add the database:

```bash
brew install postgresql@16
brew services start postgresql@16
$(brew --prefix postgresql@16)/bin/createdb gator
```

Make sure the database exists:

```bash
$(brew --prefix postgresql@16)/bin/psql gator
```

Exit PostgreSQL with:

```text
\q
```

## 3. Configure the database URL

Open `drizzle.config.ts` and replace the `url` value with a connection URL for the `gator` database. A local PostgreSQL installation normally uses your macOS username and no password:

```text
postgres://YOUR_MAC_USERNAME:@localhost:5432/gator?sslmode=disable
```

Print your exact username:

```bash
whoami
```

For example, if `whoami` prints `alice`, use:

```text
postgres://alice:@localhost:5432/gator?sslmode=disable
```

The `drizzle.config.ts` entry must match the `db_url` entry in the next step.

## 4. Run the database migrations

```bash
npm run migrate
```

## 5. Create `~/.gatorconfig.json`

Get your macOS username:

```bash
whoami
```

Replace `YOUR_MAC_USERNAME` with that value and run:

```bash
cat > ~/.gatorconfig.json <<'EOF'
{
  "db_url": "postgres://YOUR_MAC_USERNAME:@localhost:5432/gator?sslmode=disable",
  "current_user_name": ""
}
EOF
```

For example, if `whoami` returns `alice`, the file must contain:

```json
{
  "db_url": "postgres://alice:@localhost:5432/gator?sslmode=disable",
  "current_user_name": ""
}
```

## 6. Run gator

Run commands through npm:

```bash
npm start -- <command> [arguments...]
```

Create and log in to a user before running commands that require an account:

```bash
npm start -- register alice
```

## Commands

### `register`

Create a user and set that user as the current user:

```bash
npm start -- register <name>
```

### `login`

Switch to an existing user:

```bash
npm start -- login <name>
```

### `users`

List all registered users. The current user is marked with `*`:

```bash
npm start -- users
```

### `reset`

Delete all users and their related feed subscriptions and feeds:

```bash
npm start -- reset
```

This operation deletes database data and cannot be undone.

### `feeds`

List every feed in the database, along with the user associated with it:

```bash
npm start -- feeds
```

### `addfeed`

Add a feed and subscribe the current user to it. If the feed is already in the database, gator reuses it:

```bash
npm start -- addfeed "<feed name>" "<feed URL>"
```

For example:

```bash
npm start -- addfeed "Boot.dev Blog" "https://blog.boot.dev/index.xml"
```

This command requires a logged-in user.

### `follow`

Subscribe the current user to a feed that already exists in the database:

```bash
npm start -- follow "<feed URL>"
```

Use `addfeed` first if the feed URL has not been added yet.

### `following`

List the feeds that the current user follows:

```bash
npm start -- following
```

### `unfollow`

Remove the current user's subscription to a feed:

```bash
npm start -- unfollow "<feed URL>"
```

### `agg`

Start the feed aggregator. gator immediately checks for a feed, then repeatedly checks for feeds at the requested interval:

```bash
npm start -- agg <interval>
```

The interval defaults to `10s` and may use milliseconds, seconds, minutes, or hours:

```bash
npm start -- agg 30s
npm start -- agg 5m
npm start -- agg 1h
```

Press `Ctrl+C` to stop the aggregator.

### `browse`

Show the most recent posts from feeds followed by the current user:

```bash
npm start -- browse [number of posts]
```

If omitted, the number of posts defaults to `2`. For example:

```bash
npm start -- browse
npm start -- browse 10
```

The `addfeed`, `follow`, `following`, `unfollow`, and `browse` commands require a current user. Run `register` or `login` before using them.

## Typical first run

```bash
npm ci
npm run migrate
npm start -- register alice
npm start -- addfeed "Boot.dev Blog" "https://blog.boot.dev/index.xml"
npm start -- agg 10m
```

Leave the aggregator running in one terminal. In a second terminal, run:

```bash
nvm use
npm start -- browse 5
```
