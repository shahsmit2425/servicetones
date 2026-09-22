CREATE TABLE IF NOT EXISTS users (
 id text PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL,
 role text NOT NULL CHECK (role IN ('customer','pro','admin')), settings jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE profiles (
 id text PRIMARY KEY REFERENCES users(id), business text NOT NULL, category text NOT NULL,
 bio text NOT NULL, zip text NOT NULL, rate double precision NOT NULL CHECK(rate>0),
 available boolean NOT NULL DEFAULT true, availability jsonb NOT NULL DEFAULT '[]',
 verified boolean NOT NULL DEFAULT false, suspended boolean NOT NULL DEFAULT false,
 stripe_account_id text UNIQUE, identity_session_id text UNIQUE, connect_ready boolean NOT NULL DEFAULT false
);
CREATE TABLE projects (
 id uuid PRIMARY KEY, customer_id text NOT NULL REFERENCES users(id), pro_id text REFERENCES users(id),
 title text NOT NULL, description text NOT NULL, category text NOT NULL, zip text NOT NULL,
 scheduled_at timestamptz, status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','quoted','booked','in_progress','completed','cancelled','disputed')),
 previous_status text, amount integer CHECK(amount>0), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX projects_customer ON projects(customer_id,created_at);
CREATE INDEX projects_pro ON projects(pro_id,status);
CREATE TABLE quotes (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), pro_id text NOT NULL REFERENCES users(id),
 amount integer NOT NULL CHECK(amount>0),description text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined')), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(project_id,pro_id)
);
CREATE TABLE messages (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), sender_id text NOT NULL REFERENCES users(id),
 body text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_project ON messages(project_id,created_at);
CREATE TABLE payments (
 id uuid PRIMARY KEY, project_id uuid NOT NULL UNIQUE REFERENCES projects(id), amount integer NOT NULL CHECK(amount>0),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','refunded')),
 checkout_id text UNIQUE, intent_id text UNIQUE, receipt_url text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE reviews (
 id uuid PRIMARY KEY, project_id uuid NOT NULL UNIQUE REFERENCES projects(id), pro_id text NOT NULL REFERENCES users(id),
 rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5), body text NOT NULL, reply text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE tickets (
 id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES users(id), project_id uuid REFERENCES projects(id),
 subject text NOT NULL,body text NOT NULL,status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),resolution text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notifications (
 id uuid PRIMARY KEY,user_id text NOT NULL REFERENCES users(id),title text NOT NULL,body text NOT NULL,
 read boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE saved (user_id text REFERENCES users(id),pro_id text REFERENCES profiles(id),PRIMARY KEY(user_id,pro_id));
CREATE TABLE blocked (user_id text REFERENCES users(id),other_id text REFERENCES users(id),PRIMARY KEY(user_id,other_id));
CREATE TABLE uploads (
 id uuid PRIMARY KEY,project_id uuid NOT NULL REFERENCES projects(id),user_id text NOT NULL REFERENCES users(id),
 object_key text NOT NULL UNIQUE,name text NOT NULL,content_type text NOT NULL,size integer NOT NULL CHECK(size>0),
 status text NOT NULL DEFAULT 'pending',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE webhook_events (id text PRIMARY KEY,type text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE audit_log (id uuid PRIMARY KEY,actor_id text REFERENCES users(id),action text NOT NULL,entity_id text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE email_outbox (
 id uuid PRIMARY KEY,user_id text NOT NULL REFERENCES users(id),subject text NOT NULL,body text NOT NULL,
 attempts integer NOT NULL DEFAULT 0,sent_at timestamptz,next_attempt_at timestamptz NOT NULL DEFAULT now(),created_at timestamptz NOT NULL DEFAULT now()
);
