# Encrypting Your .env Files with dotenvx: Stop Leaking Secrets

## Table Of Contents

1. TL;DR
2. What Are Environment Variables and Why Do We Need Them
3. The `.env` File — and How `dotenv` Made It Standard
4. The Problem: Why `.env` Files Are Still Risky
5. Encryption to the Rescue — The Concept
6. Enter `dotenvx` — What It Is and Why It Exists
7. How `dotenvx` Encryption Works (with Python & Rust examples)
8. Wait... Can I Push `.env` to GitHub Now?
9. What Is `.env.keys`?
10. `dotenvx` in Production
11. Conclusion

---

### TL;DR

<div data-node-type="callout">
<div data-node-type="callout-emoji">⁋</div>
<div data-node-type="callout-text">This article is about why plain .env files are a security risk, and how dotenvx solves that by encrypting your secrets directly inside the .env file using public-key cryptography — so you can safely commit it to GitHub. We'll walk through real Python and Rust examples from the official dotenvx docs.</div>
</div>

---

## What Are Environment Variables and Why Do We Need Them

Let me start with a story.

You just built a cool app. It connects to a database, sends emails via an SMTP server, and calls a third-party API. You push it to GitHub. A few hours later, you get an email from AWS saying your account has been compromised and someone just spun up 47 GPU instances in your name.

What happened?

You left your credentials in the code.

```python
# main.py — please never do this
DB_PASSWORD = "super_secret_password_123"
AWS_SECRET_KEY = "AKIAIOSFODNN7EXAMPLE"
SMTP_PASSWORD = "my_email_password"
```

This is exactly the problem environment variables solve.

An **environment variable** is a key-value pair that lives in the operating system's environment — outside your code. Your application reads it at runtime instead of having it hardcoded.

```python
import os

db_password = os.getenv("DB_PASSWORD")
aws_key = os.getenv("AWS_SECRET_KEY")
```

```rust
use std::env;

fn main() {
    let db_password = env::var("DB_PASSWORD").unwrap_or_default();
    let aws_key = env::var("AWS_SECRET_KEY").unwrap_or_default();
}
```

Now the actual values are never in your source code. They live in the environment where your app runs — your local machine, your server, your CI pipeline.

### Why This Matters

The [Twelve-Factor App](https://12factor.net/config) methodology, which is the foundation of modern cloud-native development, puts it simply:

> "Config varies substantially across deploys, code does not."

A litmus test: could you open-source your codebase right now without leaking any credentials? If the answer is no, your config is not properly separated from your code.

Environment variables fix that. But then comes the next question: how do you manage them across your team, your machines, and your deployments?

---

## The `.env` File — and How `dotenv` Made It Standard

Setting environment variables manually on every machine is painful. You'd have to run something like this every time you start a new terminal session:

```sh
export DB_PASSWORD="super_secret_password_123"
export AWS_SECRET_KEY="AKIAIOSFODNN7EXAMPLE"
export SMTP_PASSWORD="my_email_password"
```

That's not sustainable. So in 2012, Heroku introduced the `.env` file format. The idea was simple: put all your environment variables in a single file at the root of your project.

```ini
# .env
DB_PASSWORD="super_secret_password_123"
AWS_SECRET_KEY="AKIAIOSFODNN7EXAMPLE"
SMTP_PASSWORD="my_email_password"
```

Then in 2013, the `dotenv` library for Node.js (and later Ruby, Python, and others) popularized loading this file automatically at startup. Today it's an industry standard — virtually every language and framework has a dotenv implementation.

### The `.env` File Format

The format is intentionally simple:

```ini
# Lines starting with # are comments
PLAIN_VALUE=hello
QUOTED_VALUE="hello world"
SINGLE_QUOTED='no $interpolation here'

# Variable interpolation works in unquoted and double-quoted values
USERNAME="piush"
DATABASE_URL="postgres://${USERNAME}@localhost/mydb"
```

Rules worth knowing:
- Blank lines are ignored
- `#` starts a comment (when on its own line or after a quoted value)
- Single quotes prevent variable interpolation
- Double quotes and unquoted values support `${VAR}` expansion

### How `dotenv` Loads It

In Python, without any library, `os.getenv` returns `None` for anything not already in the shell environment:

```python
# Without dotenvx/dotenv, os.getenv returns None
import os
print(os.getenv("DB_PASSWORD"))  # None
```

With `python-dotenv`, you load the `.env` file explicitly at startup:

```python
# pip install python-dotenv
from dotenv import load_dotenv
import os

load_dotenv()  # reads .env and injects into os.environ

print(os.getenv("DB_PASSWORD"))  # super_secret_password_123
```

In Rust, the equivalent is the `dotenvy` crate:

```rust
// Cargo.toml: dotenvy = "0.15"
use std::env;

fn main() {
    dotenvy::dotenv().ok(); // reads .env and injects into std::env

    let db_password = env::var("DB_PASSWORD").unwrap_or_default();
    println!("DB_PASSWORD: {}", db_password); // super_secret_password_123
}
```

With a dotenv library, the `.env` file is parsed and its values are injected into the process environment before your app code runs. Clean, simple, and universally understood.

But there's a catch.

---

## The Problem: Why `.env` Files Are Still Risky

The `.env` file solved the "don't hardcode secrets" problem. But it introduced a new one.

Everyone knows you should add `.env` to your `.gitignore`. But in practice:

- Someone forgets to add it
- A new team member clones the repo and commits their local `.env`
- A CI script accidentally logs the file contents
- The `.env` file ends up in a Docker image layer
- A backup tool syncs it somewhere it shouldn't go

And the consequences are real. GitHub's secret scanning catches thousands of leaked credentials every day. The AWS story I opened with? That happens constantly.

### The Deeper Issue

Even if you're careful with `.gitignore`, you still have the problem of **distributing secrets to your team**. How do you share the `.env` file with a new developer? Slack? Email? A shared Google Doc?

All of those are worse than just committing it to the repo.

And then there's the question of **multiple environments**. You have `.env` for local development, `.env.staging` for staging, `.env.production` for production. Each has different values. Managing all of these securely, across a team, without a dedicated secrets manager, is genuinely hard.

Here's what the typical "careful" developer's workflow actually looks like — and where it still breaks down:

```mermaid
flowchart TD
    A["Developer writes code"] --> B["Creates .env with secrets"]
    B --> C{"Remembers .gitignore?"}
    C -->|Yes| D["Adds .env to .gitignore"]
    C -->|No| E["[!] Commits .env to GitHub\nSecrets are now public"]
    D --> F["New dev joins the team"]
    F --> G["How to share .env?"]
    G --> H["Slack DM (risky)"]
    G --> I["Email (risky)"]
    G --> J["Shared Google Doc (risky)"]
    H & I & J --> K["Secret now lives in\n3 more uncontrolled places"]
    D --> L["Secret changes"]
    L --> M["Manually notify everyone\nto update their local .env"]
    M --> N["Someone forgets\n[!] App breaks in dev"]
```

Every step in that flow is a potential leak or a coordination headache.

### What We Actually Want

Ideally, we want:
1. Secrets stored close to the code (in the repo, versioned, reviewable)
2. But encrypted, so even if the file leaks, the values are safe
3. With a separate decryption key that lives outside the repo
4. That works for any language, not just Node.js

That's exactly what `dotenvx` delivers.

---

## Encryption to the Rescue — The Concept

Before we get into `dotenvx` specifically, let's understand the encryption model it uses.

`dotenvx` uses **public-key cryptography** — specifically the `secp256k1` elliptic curve, the same one used by Bitcoin. The full scheme is called **ECIES** (Elliptic Curve Integrated Encryption Scheme).

Here's the 10,000-foot view:

```mermaid
flowchart LR
    subgraph Setup["One-time setup: dotenvx encrypt"]
        KP["Generate secp256k1\nkey pair"]
        PUB["DOTENV_PUBLIC_KEY\n→ lives in .env"]
        PRIV["DOTENV_PRIVATE_KEY\n→ lives in .env.keys"]
        KP --> PUB
        KP --> PRIV
    end

    subgraph Encrypt["Per-secret encryption"]
        S["Secret value\n'super_secret_123'"]
        E["encrypted:BDqDB..."]
        S -->|"ECIES with public key"| E
    end

    subgraph Commit["What goes to GitHub"]
        CENV["[ok] .env\n(encrypted values + public key)"]
        CKEYS["[x] .env.keys\n(gitignored — never committed)"]
    end

    PUB --> Encrypt
    Encrypt --> CENV
    PRIV --> CKEYS
```

The public key encrypts. The private key decrypts. You commit the encrypted `.env` (with the public key embedded). You keep the private key in `.env.keys`, which you **never commit**.

### How ECIES Actually Works (The Real Mechanism)

This is where it gets interesting. ECIES doesn't just "encrypt with the public key" — that would be slow and size-limited. Instead it uses a clever hybrid approach with three stages.

**Stage 1 — ECDH: Derive a shared secret**

Every time a secret is encrypted, dotenvx generates a brand new random **ephemeral key pair** on the secp256k1 curve. It then uses Elliptic Curve Diffie-Hellman (ECDH) to combine the ephemeral private key with your `DOTENV_PUBLIC_KEY` to produce a shared secret. Crucially, this shared secret can also be reproduced later using the ephemeral public key and your `DOTENV_PRIVATE_KEY` — that's the magic of ECDH.

```mermaid
flowchart TD
    subgraph Sender["dotenvx (encrypting)"]
        EPH["Generate ephemeral\nkey pair\n(eph_private, eph_public)"]
        ECDH1["ECDH(\n  eph_private,\n  DOTENV_PUBLIC_KEY\n)"]
        SS1["Shared Secret S"]
        EPH --> ECDH1 --> SS1
    end

    subgraph Receiver["dotenvx run (decrypting)"]
        ECDH2["ECDH(\n  DOTENV_PRIVATE_KEY,\n  eph_public\n)"]
        SS2["Same Shared Secret S"]
        ECDH2 --> SS2
    end

    EPH -->|"eph_public travels\ninside the ciphertext"| ECDH2

    note1["Both sides arrive at the\nsame shared secret S\nwithout S ever being transmitted"]
```

**Stage 2 — HKDF: Derive an AES key from the shared secret**

The raw ECDH output isn't used directly as an encryption key — it goes through **HKDF-SHA256** (a key derivation function) to produce a proper 32-byte AES-256 key. This step ensures the key has uniform randomness and is cryptographically separated from the raw shared secret.

```mermaid
flowchart LR
    SS["Shared Secret S\n(raw ECDH output)"] --> HKDF["HKDF-SHA256\nkey derivation"]
    HKDF --> AES_KEY["32-byte AES-256 key\n(session key)"]
    RAND["Random 16-byte\nnonce / IV"] --> AES_KEY
```

**Stage 3 — AES-256-GCM: Encrypt the actual secret value**

The derived AES key encrypts the plaintext secret value using **AES-256-GCM** — an authenticated encryption mode that simultaneously encrypts and produces a MAC tag for integrity verification.

```mermaid
flowchart TD
    PLAIN["Plaintext secret\n'super_secret_123'"]
    AES_KEY["AES-256 session key"]
    NONCE["Random nonce (16 bytes)"]
    GCM["AES-256-GCM\nEncrypt + Authenticate"]
    CIPHER["Ciphertext"]
    TAG["Auth Tag / MAC\n(16 bytes)"]

    PLAIN --> GCM
    AES_KEY --> GCM
    NONCE --> GCM
    GCM --> CIPHER
    GCM --> TAG
```

**The final payload — what gets stored in `.env`**

All the pieces are bundled together and base64-encoded into the `encrypted:...` string you see in the file:

```mermaid
flowchart LR
    A["Ephemeral Public Key\n65 bytes\n(secp256k1 point)"]
    B["Nonce / IV\n16 bytes"]
    C["Auth Tag / MAC\n16 bytes"]
    D["Encrypted secret value\nvariable length"]
    A --- B --- C --- D
```

This is why:
- **Every encrypted value looks different** — a fresh ephemeral key pair and nonce are generated each time, even for identical plaintext
- **Breaking one value doesn't help with others** — each has its own ephemeral key and AES session key
- **Tampering is detected** — the GCM auth tag covers both the ciphertext and the ephemeral public key; any modification fails verification before decryption even starts

### The Full Encryption Flow

Putting all three stages together:

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant CLI as dotenvx CLI
    participant FS as File System

    Dev->>CLI: dotenvx encrypt

    CLI->>CLI: Generate long-term secp256k1 key pair
    Note over CLI: DOTENV_PUBLIC_KEY → .env<br/>DOTENV_PRIVATE_KEY → .env.keys

    loop For each secret value in .env
        CLI->>CLI: 1. Generate random ephemeral key pair (eph_priv, eph_pub)
        CLI->>CLI: 2. ECDH(eph_priv, DOTENV_PUBLIC_KEY) → shared secret S
        CLI->>CLI: 3. HKDF-SHA256(S) → 32-byte AES session key
        CLI->>CLI: 4. Generate random 16-byte nonce
        CLI->>CLI: 5. AES-256-GCM(session key, nonce, plaintext) → ciphertext + tag
        CLI->>CLI: 6. Bundle: eph_pub ‖ nonce ‖ tag ‖ ciphertext → base64
        CLI->>CLI: 7. Write "encrypted:BASE64..." to .env
    end

    CLI->>FS: Updated .env (encrypted values + DOTENV_PUBLIC_KEY)
    CLI->>FS: New .env.keys (DOTENV_PRIVATE_KEY)
    CLI-->>Dev: ✔ encrypted (.env) + local key (.env.keys)
```

### The Full Decryption Flow

And the reverse — what happens when you run `dotenvx run -- yourcommand`:

```mermaid
sequenceDiagram
    participant Dev as Developer / Server
    participant CLI as dotenvx run
    participant FS as .env file
    participant App as Your App Process

    Dev->>CLI: dotenvx run -- python main.py

    CLI->>CLI: Locate DOTENV_PRIVATE_KEY<br/>(env var → .env.keys file)
    CLI->>FS: Read encrypted .env

    loop For each "encrypted:BASE64..." value
        CLI->>CLI: 1. Base64-decode → extract eph_pub ‖ nonce ‖ tag ‖ ciphertext
        CLI->>CLI: 2. ECDH(DOTENV_PRIVATE_KEY, eph_pub) → shared secret S
        CLI->>CLI: 3. HKDF-SHA256(S) → same 32-byte AES session key
        CLI->>CLI: 4. AES-256-GCM verify tag → reject if tampered
        CLI->>CLI: 5. AES-256-GCM decrypt → plaintext secret value
    end

    CLI->>App: Spawn process with all decrypted env vars injected
    Note over App: os.getenv("DB_PASSWORD")<br/>→ "super_secret_password_123"
    App-->>Dev: App runs normally
```

The private key is used only for a moment at startup, then discarded. It never touches disk on the server — it comes in as an environment variable and leaves with the process.

The result looks like this in your `.env` file after encryption:

```ini
#/-------------------[DOTENV_PUBLIC_KEY]--------------------/
#/            public-key encryption for .env files          /
#/       [how it works](https://dotenvx.com/encryption)     /
#/----------------------------------------------------------/
DOTENV_PUBLIC_KEY="034af93e93708b994c10f236c96ef88e47291066946cce2e8d98c9e02c741ced45"

# .env
DB_PASSWORD="encrypted:BDqDBibm4wsYqMpCjTQ6BsDHmMadg9K3dAt+Z9HPMfLEIRVz50hmLXPXRuDBXaJi/LwWYEVUNiq0HISrslzQPaoyS8Lotg3gFWJTsNCdOWnqpjF2xNUX2RQiP05kAbEXM6MWVjDr"
```

The public key is right there in the file — that's fine, it can only encrypt. The private key is what you protect.

---

## Enter `dotenvx` — What It Is and Why It Exists

`dotenvx` is a CLI tool (and Node.js library) built by the creator of the original `dotenv`. It does everything `dotenv` does, plus:

- **Encryption** — encrypt `.env` files with one command
- **Multi-environment** — manage `.env`, `.env.production`, `.env.staging` cleanly
- **Cross-language** — works as a CLI wrapper for any language (Python, Rust, Go, Ruby, PHP, etc.)
- **Runtime injection** — injects decrypted values at process startup, so your app code doesn't change

The key insight is that `dotenvx` acts as a **process wrapper**. Instead of running your app directly, you run it through `dotenvx run --`:

```sh
# Before dotenvx
python main.py

# With dotenvx
dotenvx run -- python main.py

# With dotenvx (Rust)
dotenvx run -- cargo run
```

`dotenvx` reads the `.env` file, decrypts any encrypted values using the private key, injects them into the process environment, then hands off to your actual command. Your app code reads `os.getenv()` or `std::env::var()` exactly as before — nothing changes in your application code.

### Installing dotenvx

```sh
# via curl (works everywhere)
curl -sfS https://dotenvx.sh | sh

# via brew (macOS/Linux)
brew install dotenvx/brew/dotenvx

# via npm (if you're in a Node.js project)
npm install @dotenvx/dotenvx --save
```

---

## How `dotenvx` Encryption Works (with Python & Rust examples)

Let's walk through the full workflow from scratch.

### Step 1: Create your `.env` file

```ini
# .env
HELLO=World
DB_PASSWORD=super_secret_password_123
API_KEY=sk-abc123xyz
```

### Step 2: Encrypt it

```sh
$ dotenvx encrypt
✔ encrypted (.env)
✔ key added to .env.keys (DOTENV_PRIVATE_KEY)
⮕  next run [dotenvx ext gitignore --pattern .env.keys] to gitignore .env.keys
⮕  next run [DOTENV_PRIVATE_KEY='122...0b8' dotenvx run -- yourcommand] to test decryption locally
```

Your `.env` file now looks like:

```ini
#/-------------------[DOTENV_PUBLIC_KEY]--------------------/
#/            public-key encryption for .env files          /
#/       [how it works](https://dotenvx.com/encryption)     /
#/----------------------------------------------------------/
DOTENV_PUBLIC_KEY="034af93e93708b994c10f236c96ef88e47291066946cce2e8d98c9e02c741ced45"

# .env
HELLO="encrypted:BDqDBibm4wsYqMpCjTQ6BsDHmMadg9K3dAt+Z9HPMfLEIRVz50hmLXPXRuDBXaJi..."
DB_PASSWORD="encrypted:BE9Y7LKANx77X1pv1HnEoil93fPa5c9rpL/1ps48uaRT9zM8VR6mHx9yM+HktKds..."
API_KEY="encrypted:BF3kPQmNx88Y2qw2IoFpPb6Qd0eRsqMn/2qt59vbSU0azN9TW7IyJz0aN+LluEt..."
```

And a new `.env.keys` file was created:

```ini
#/------------------!DOTENV_PRIVATE_KEYS!-------------------/
#/ private decryption keys. DO NOT commit to source control /
#/     [how it works](https://dotenvx.com/encryption)       /
#/----------------------------------------------------------/

# .env
DOTENV_PRIVATE_KEY="122...0b8"
```

### Step 3: Gitignore `.env.keys`

```sh
$ dotenvx ext gitignore --pattern .env.keys
✔ ignored .env.keys (.gitignore)
```

Now `.env.keys` is gitignored. Your encrypted `.env` is safe to commit.

### Step 4: Run your app

**Python:**

```python
# main.py
import os

print(f"HELLO: {os.getenv('HELLO')}")
print(f"DB_PASSWORD: {os.getenv('DB_PASSWORD')}")
```

```sh
$ dotenvx run -- python main.py
[dotenvx@1.x.x] injecting env (3) from .env
HELLO: World
DB_PASSWORD: super_secret_password_123
```

**Rust:**

```rust
// src/main.rs
use std::env;

fn main() {
    let hello = env::var("HELLO").unwrap_or_default();
    let db_password = env::var("DB_PASSWORD").unwrap_or_default();

    println!("HELLO: {}", hello);
    println!("DB_PASSWORD: {}", db_password);
}
```

```sh
$ dotenvx run -- cargo run
[dotenvx@1.x.x] injecting env (3) from .env
HELLO: World
DB_PASSWORD: super_secret_password_123
```

Your application code is completely unchanged. `dotenvx` handles the decryption transparently at the process boundary.

### Setting Individual Values

You can also set and encrypt individual values without editing the file manually:

```sh
$ dotenvx set NEW_SECRET "my-new-value"
set NEW_SECRET with encryption (.env)
```

This encrypts the value immediately and writes it to `.env`. The public key is already there from the initial `dotenvx encrypt`, so no new key pair is generated.

### Multiple Environments

`dotenvx` handles multiple environment files cleanly:

```sh
# Encrypt your production env
$ dotenvx encrypt -f .env.production
✔ encrypted (.env.production)
✔ key added to .env.keys (DOTENV_PRIVATE_KEY_PRODUCTION)

# Run with production env
$ DOTENV_PRIVATE_KEY_PRODUCTION="<key>" dotenvx run -f .env.production -- python main.py
```

Notice the naming convention: `DOTENV_PRIVATE_KEY_PRODUCTION` maps to `.env.production`. `DOTENV_PRIVATE_KEY_STAGING` maps to `.env.staging`. The suffix is derived from the filename.

---

## Wait... Can I Push `.env` to GitHub Now?

Yes. That's the whole point.

Once your `.env` is encrypted, it's safe to commit. The encrypted values are mathematically useless without the private key, and the private key is in `.env.keys` which is gitignored.

This is a significant shift from the traditional workflow:

| | Traditional | With dotenvx |
|---|---|---|
| `.env` in git | Never (risky) | Safe (encrypted) |
| Secret sharing | Slack/email | Pull the repo |
| Secret history | None | Full git history |
| Secret diffs in PRs | Impossible | Visible (encrypted) |
| New dev onboarding | Manual secret handoff | Clone + get private key once |

The only thing you still need to share out-of-band is the private key from `.env.keys`. But that's one secret per environment, not dozens. And you only share it once per developer, not every time a secret changes.

> The encrypted `.env` file is safe and **recommended** to commit to source control. The `.env.keys` file must **never** be committed.

---

## What Is `.env.keys`?

`.env.keys` is the file that holds your private decryption keys. It's generated automatically when you first run `dotenvx encrypt`.

```ini
#/------------------!DOTENV_PRIVATE_KEYS!-------------------/
#/ private decryption keys. DO NOT commit to source control /
#/     [how it works](https://dotenvx.com/encryption)       /
#/----------------------------------------------------------/

# .env
DOTENV_PRIVATE_KEY="122...0b8"

# .env.production
DOTENV_PRIVATE_KEY_PRODUCTION="bff...bc4"

# .env.staging
DOTENV_PRIVATE_KEY_STAGING="a3d...f91"
```

Each environment gets its own key pair. The public keys live in the respective `.env` files. The private keys all live here.

### How `dotenvx run` Finds the Key

When you run `dotenvx run -- yourcommand`, it looks for the private key in two places, in this order:

1. **Environment variable** — `DOTENV_PRIVATE_KEY` (or `DOTENV_PRIVATE_KEY_PRODUCTION`, etc.)
2. **`.env.keys` file** — if the env var isn't set, it reads from the file

```mermaid
flowchart TD
    A["dotenvx run -- yourcommand"] --> B{"Is DOTENV_PRIVATE_KEY\nset as env var?"}
    B -->|Yes| D["Use it to decrypt .env"]
    B -->|No| C{"Does .env.keys\nfile exist?"}
    C -->|Yes| E["Read DOTENV_PRIVATE_KEY\nfrom .env.keys"]
    C -->|No| F["[!] Error: no private key found\nCannot decrypt"]
    E --> D
    D --> G["Inject decrypted values\ninto process environment"]
    G --> H["Hand off to your command"]
```

This means:
- **Locally**: keep `.env.keys` in your project root (gitignored). `dotenvx run` finds it automatically.
- **In production**: set `DOTENV_PRIVATE_KEY_PRODUCTION` as an environment variable in your server/cloud provider. No `.env.keys` file needed on the server.

```sh
# Local development — dotenvx reads from .env.keys automatically
dotenvx run -- python main.py

# Production server — key is set as an env var
DOTENV_PRIVATE_KEY_PRODUCTION="bff...bc4" dotenvx run -- python main.py
```

### Rotating Keys

If a private key is ever compromised, you can rotate it:

```sh
$ dotenvx rotate
✔ rotated (.env)
```

This generates a new key pair, re-encrypts all values with the new public key, and updates `.env.keys` with the new private key. The old key is invalidated.

```mermaid
flowchart TD
    A["dotenvx rotate"] --> B["Generate new secp256k1 key pair"]
    B --> C["New DOTENV_PUBLIC_KEY"]
    B --> D["New DOTENV_PRIVATE_KEY"]
    C --> E["Re-encrypt all values\nin .env with new public key"]
    E --> F["Updated .env\n(new encrypted blobs)"]
    D --> G["Updated .env.keys\n(new private key)"]
    H["Old private key"] --> I["[x] Invalidated\nCan no longer decrypt"]
    F & G --> J["Share new private key\nwith team out-of-band\n(one time)"]
```

---

## `dotenvx` in Production

This is where the workflow really pays off.

### The Recommended Pattern

1. Commit your encrypted `.env.production` to the repo
2. Set `DOTENV_PRIVATE_KEY_PRODUCTION` as a secret in your cloud provider (AWS Secrets Manager, GitHub Actions secrets, Heroku config vars, etc.)
3. Your deploy command becomes: `dotenvx run -- yourcommand`

That's it. No secrets manager SDK to integrate. No API calls at startup. No vendor lock-in. The decryption happens locally at process startup using the key from the environment.

Here's how the full local-to-production flow looks:

```mermaid
flowchart LR
    subgraph Local["Local Machine"]
        direction TB
        ENV[".env\n(encrypted, committed)"]
        KEYS[".env.keys\n(gitignored, local only)"]
        RUN1["dotenvx run --\npython main.py"]
        KEYS -->|"private key"| RUN1
        ENV -->|"encrypted values"| RUN1
        RUN1 --> APP1["App runs with\nplaintext secrets"]
    end

    subgraph Repo["GitHub Repo"]
        direction TB
        EENV[".env (encrypted)\nsafe to store"]
        NOKEYS[".env.keys\nnot here"]
    end

    subgraph Prod["Production Server"]
        direction TB
        ENVVAR["DOTENV_PRIVATE_KEY_PRODUCTION\nset as server env var"]
        RUN2["dotenvx run --\npython main.py"]
        ENVVAR -->|"private key"| RUN2
        EENV2[".env.production\n(from repo, encrypted)"] -->|"encrypted values"| RUN2
        RUN2 --> APP2["App runs with\nplaintext secrets"]
    end

    Local -->|"git push"| Repo
    Repo -->|"git pull / deploy"| Prod
```

### GitHub Actions

```yaml
name: deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: curl -sfS https://dotenvx.sh | sh
      - run: dotenvx run -- python deploy.py
        env:
          DOTENV_PRIVATE_KEY_PRODUCTION: ${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}
```

Your encrypted `.env.production` is already in the repo. The only secret in GitHub Actions is the private key.

### Docker

```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY . .

RUN pip install -r requirements.txt
RUN curl -fsS https://dotenvx.sh | sh

# .env.production is already in the repo (encrypted)
CMD ["dotenvx", "run", "--", "python", "main.py"]
```

Set `DOTENV_PRIVATE_KEY_PRODUCTION` in your container environment (ECS task definition, Kubernetes secret, etc.) and the container decrypts at startup.

### Rust with Cargo

```dockerfile
FROM rust:1.78-slim

WORKDIR /app
COPY . .

RUN cargo build --release
RUN curl -fsS https://dotenvx.sh | sh

CMD ["dotenvx", "run", "--", "./target/release/myapp"]
```

### Python with Flask/FastAPI

```sh
# Development
dotenvx run -- flask --app index run

# Production (gunicorn)
DOTENV_PRIVATE_KEY_PRODUCTION="bff...bc4" dotenvx run -- gunicorn index:app
```

### Pre-commit Hook (Prevent Accidental Leaks)

Install a pre-commit hook that blocks committing unencrypted `.env` files:

```sh
$ dotenvx ext precommit --install
[dotenvx][precommit] dotenvx ext precommit installed [.git/hooks/pre-commit]
```

Now if you try to commit a plaintext `.env`, git will block it.

### When to Use `dotenvx` vs a Dedicated Secrets Manager

`dotenvx` is not a replacement for HashiCorp Vault or AWS Secrets Manager in every scenario. Here's a rough guide:

| Scenario | Recommendation |
|---|---|
| Solo project / small team | `dotenvx` — simple, zero infrastructure |
| Open source project | `dotenvx` — encrypted envs can live in the repo |
| Startup / growing team | `dotenvx` — scales well, low overhead |
| Enterprise with compliance requirements | Dedicated secrets manager + `dotenvx` for local dev |
| Need secret rotation across many services | Dedicated secrets manager |
| Need audit logs of secret access | Dedicated secrets manager |

For most projects, `dotenvx` hits the sweet spot: meaningfully better security than plain `.env` files, with almost zero added complexity.

---

## Conclusion

We started with a simple problem: secrets don't belong in code. The `.env` file solved that, but introduced a new problem — a plaintext file full of credentials sitting in your project directory, one accidental `git add .` away from disaster.

`dotenvx` closes that gap. By encrypting the `.env` file itself using public-key cryptography, it lets you:

- Commit your `.env` files to git (safely)
- Version and diff your secrets like any other config
- Share secrets with teammates via the repo instead of Slack
- Deploy to production with a single private key env var

And it does all of this without changing a single line of your application code. Your Python `os.getenv()` and your Rust `env::var()` calls work exactly as before.

The workflow shift is small. The security improvement is significant.

```sh
# The entire dotenvx workflow in 4 commands
dotenvx encrypt                          # encrypt your .env
dotenvx ext gitignore --pattern .env.keys  # gitignore the private key file
git add .env && git commit -m "encrypted env"  # safely commit
dotenvx run -- yourcommand              # run with decryption at runtime
```

That's it. Safer secrets, same developer experience.

---

[^1]: **How dotenvx encryption works under the hood:**
    - dotenvx uses **ECIES** (Elliptic Curve Integrated Encryption Scheme) with the `secp256k1` curve — the same elliptic curve used by Bitcoin.
    - When you run `dotenvx encrypt`, a `DOTENV_PUBLIC_KEY` / `DOTENV_PRIVATE_KEY` pair is generated. The public key is embedded in the `.env` file. The private key goes to `.env.keys`.
    - Each secret value is encrypted with a **unique ephemeral AES-256 key**. That AES key is then encrypted using the `secp256k1` public key. This is the ECIES construction.
    - At runtime, `dotenvx run` reads the private key (from `.env.keys` or a `DOTENV_PRIVATE_KEY*` env var), decrypts the AES key, then decrypts the secret value. The plaintext is injected into the process environment and the keys are discarded.
    - The encrypted `.env` file is safe to commit because breaking it requires brute-forcing both AES-256 and elliptic curve cryptography simultaneously — computationally infeasible with current technology.
    - Read the [dotenvx whitepaper](https://dotenvx.com/dotenvx.pdf) for the full cryptographic specification.
