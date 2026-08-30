CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    document TEXT,
    phone TEXT,
    plan TEXT NOT NULL DEFAULT 'PRO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emitters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    document TEXT,
    state_registration TEXT,
    municipal_registration TEXT,
    tax_regime TEXT,
    cnae TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    website TEXT,
    cep CHAR(8),
    address TEXT,
    address_number TEXT,
    complement TEXT,
    district TEXT,
    city TEXT,
    state CHAR(2),
    nfce_environment TEXT DEFAULT 'homologacao',
    nfce_series TEXT,
    nfce_next_number INT DEFAULT 1,
    sat_code TEXT,
    certificate_path TEXT,
    certificate_expires_at DATE,
    logo_url TEXT,
    receipt_footer TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'gerente', 'caixa', 'garcom', 'cozinha', 'bar', 'entregador')),
    password_hash TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    printer_name TEXT,
    printer_type TEXT DEFAULT 'network',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ceps (
    cep CHAR(8) PRIMARY KEY,
    bairro TEXT,
    logradouro TEXT,
    codigo_municipio TEXT
);

CREATE INDEX IF NOT EXISTS idx_ceps_bairro ON ceps (bairro);
CREATE INDEX IF NOT EXISTS idx_ceps_codigo_municipio ON ceps (codigo_municipio);

CREATE TABLE IF NOT EXISTS delivery_districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    estimated_minutes INT NOT NULL DEFAULT 35,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(company_id, name)
);

CREATE TABLE IF NOT EXISTS dining_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    seats INT NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved', 'closing')),
    waiter_id UUID REFERENCES users(id),
    opened_at TIMESTAMPTZ,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS service_tabs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    tab_type TEXT NOT NULL DEFAULT 'fisica' CHECK (tab_type IN ('fisica', 'digital', 'qr_code')),
    status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'open', 'closing', 'closed', 'cancelled')),
    customer_name TEXT,
    waiter_id UUID REFERENCES users(id),
    opened_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    delivery_district_id UUID REFERENCES delivery_districts(id),
    name TEXT NOT NULL,
    phone TEXT,
    cep CHAR(8),
    address TEXT,
    address_number TEXT,
    complement TEXT,
    district TEXT,
    city TEXT,
    state CHAR(2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    legal_name TEXT NOT NULL,
    trade_name TEXT,
    document TEXT,
    state_registration TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    category TEXT,
    payment_term TEXT,
    cep CHAR(8),
    address TEXT,
    address_number TEXT,
    district TEXT,
    city TEXT,
    state CHAR(2),
    contact_name TEXT,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    code TEXT,
    name TEXT NOT NULL,
    group_type TEXT,
    print_sector TEXT,
    icon TEXT,
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    UNIQUE(company_id, code)
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id),
    sector_id UUID REFERENCES sectors(id),
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    barcode TEXT,
    price NUMERIC(12,2) NOT NULL DEFAULT 0,
    cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    track_stock BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT NOT NULL CHECK (unit IN ('g', 'kg', 'ml', 'l', 'un')),
    stock_qty NUMERIC(14,3) NOT NULL DEFAULT 0,
    min_qty NUMERIC(14,3) NOT NULL DEFAULT 0,
    avg_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
    expires_at DATE
);

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    quantity NUMERIC(14,3) NOT NULL,
    UNIQUE(product_id, ingredient_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ticket TEXT NOT NULL UNIQUE,
    table_id UUID REFERENCES dining_tables(id),
    customer_id UUID REFERENCES customers(id),
    waiter_id UUID REFERENCES users(id),
    channel TEXT NOT NULL CHECK (channel IN ('mesa', 'balcao', 'delivery', 'qr_code', 'whatsapp')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'sent', 'preparing', 'ready', 'delivering', 'closed', 'cancelled')),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    sector_id UUID REFERENCES sectors(id),
    quantity NUMERIC(12,3) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    observation TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'preparing', 'ready', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    courier_id UUID REFERENCES users(id),
    district TEXT,
    fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    commission NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'out_for_delivery', 'delivered', 'returned')),
    estimated_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS cash_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    cashier_id UUID NOT NULL REFERENCES users(id),
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    closed_at TIMESTAMPTZ,
    opening_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    closing_amount NUMERIC(12,2),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    cash_session_id UUID REFERENCES cash_sessions(id),
    method TEXT NOT NULL CHECK (method IN ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'fiado', 'convenio')),
    amount NUMERIC(12,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
    account_plan TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at DATE,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'overdue', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id),
    product_id UUID REFERENCES products(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'perda', 'ajuste', 'producao')),
    reason TEXT NOT NULL,
    quantity NUMERIC(14,3) NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    responsible_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
