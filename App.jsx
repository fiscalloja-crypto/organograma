import streamlit as st

# Configuração da página para ocupar o máximo de espaço
st.set_page_config(page_title="Quadro Branco de Organograma", layout="wide", page_icon="🎨")

# --- 1. ESTADO DA APLICAÇÃO ---
if 'roles' not in st.session_state:
    st.session_state.roles = {
        'gerente': {
            'title': 'Gerente Geral',
            'person': 'Nome do Gestor',
            'icon': '👥',
            'x': 45, 'y': 50,
            'color': '#2563eb',
            'parent': None
        },
        'vendedor_1': {
            'title': 'Vendedor 1',
            'person': 'João Silva',
            'icon': '🛍️',
            'x': 25, 'y': 250,
            'color': '#10b981',
            'parent': 'gerente'
        },
        'vendedor_2': {
            'title': 'Vendedor 2',
            'person': 'Maria Souza',
            'icon': '🛍️',
            'x': 65, 'y': 250,
            'color': '#10b981',
            'parent': 'gerente'
        }
    }

# --- 2. BARRA LATERAL (PAINEL DE CONTROLE) ---
st.sidebar.header("🛠️ Painel de Gestão")

# Adicionar Novo Cargo
with st.sidebar.expander("➕ Criar Novo Cargo"):
    with st.form("novo_cargo"):
        new_id = st.text_input("ID Único (ex: caixa_1)").lower().replace(" ", "_")
        new_t = st.text_input("Cargo")
        new_p = st.text_input("Colaborador")
        if st.form_submit_button("Adicionar ao Quadro"):
            if new_id and new_id not in st.session_state.roles:
                st.session_state.roles[new_id] = {
                    'title': new_t, 'person': new_p, 'icon': '👤',
                    'x': 50, 'y': 150, 'color': '#475569', 'parent': None
                }
                st.rerun()

st.sidebar.divider()

# Editor de Seleção
role_keys = list(st.session_state.roles.keys())
if role_keys:
    selected_key = st.sidebar.selectbox(
        "Selecionar para editar:", 
        role_keys, 
        format_func=lambda x: f"{st.session_state.roles[x]['icon']} {st.session_state.roles[x]['title']}"
    )

    role = st.session_state.roles[selected_key]
    
    with st.sidebar.container():
        st.subheader("📍 Posição no Quadro")
        role['x'] = st.slider("Horizontal (X %)", 0, 100, role['x'], key=f"x_{selected_key}")
        role['y'] = st.number_input("Vertical (Y px)", 0, 3000, role['y'], step=50, key=f"y_{selected_key}")
        
        st.divider()
        st.subheader("🔗 Hierarquia (Ligação)")
        possible_parents = [None] + [k for k in role_keys if k != selected_key]
        role['parent'] = st.selectbox(
            "Superior Direto:", 
            possible_parents,
            index=possible_parents.index(role['parent']) if role['parent'] in possible_parents else 0,
            key=f"parent_{selected_key}"
        )

        st.divider()
        st.subheader("📝 Informações")
        role['title'] = st.text_input("Nome do Cargo", role['title'], key=f"t_{selected_key}")
        role['person'] = st.text_input("Nome do Colaborador", role['person'], key=f"p_{selected_key}")
        role['color'] = st.color_picker("Cor do Cartão", role['color'], key=f"c_{selected_key}")
        
        if st.sidebar.button("🗑️ Remover Cargo", type="secondary"):
            del st.session_state.roles[selected_key]
            st.rerun()

# --- 3. RENDERIZAÇÃO DO QUADRO ---
st.title("🎨 Quadro Branco de Organograma")
st.caption("Organize a sua estrutura livremente arrastando os valores na barra lateral.")

# CSS para o Quadro e Conectores
st.markdown("""
    <style>
    .canvas-container {
        position: relative;
        width: 100%;
        height: 850px;
        background-color: #f0f2f5;
        background-image: radial-gradient(#d1d1d1 1px, transparent 1px);
        background-size: 30px 30px;
        border-radius: 20px;
        border: 2px solid #e0e0e0;
        overflow: hidden;
    }
    .org-card {
        position: absolute;
        width: 200px;
        padding: 12px;
        border-radius: 12px;
        color: white;
        text-align: center;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10;
        border: 1px solid rgba(255,255,255,0.2);
    }
    .connector-svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 5;
    }
    </style>
""", unsafe_allow_html=True)

# Gerar HTML do Quadro e Linhas
canvas_html = '<div class="canvas-container">'

# Camada de Linhas (SVG)
canvas_html += '<svg class="connector-svg">'
for key, data in st.session_state.roles.items():
    if data['parent'] and data['parent'] in st.session_state.roles:
        parent = st.session_state.roles[data['parent']]
        # Cálculo aproximado dos pontos centrais (X em % precisa ser convertido para uma base visual)
        # Como o container é fluido, as linhas são estimadas
        x1, y1 = f"{parent['x']}%", f"{parent['y'] + 60}px"
        x2, y2 = f"{data['x']}%", f"{data['y']}px"
        canvas_html += f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,5" />'
canvas_html += '</svg>'

# Camada de Cartões
for key, data in st.session_state.roles.items():
    style = f"left: calc({data['x']}% - 100px); top: {data['y']}px; background-color: {data['color']};"
    
    card_content = f"""
        <div class="org-card" style="{style}">
            <div style="font-size: 22px;">{data['icon']}</div>
            <div style="font-weight: 700; font-size: 15px; margin-top: 4px;">{data['title']}</div>
            <div style="font-size: 12px; opacity: 0.85; margin-top: 5px; padding-top: 5px; border-top: 1px solid rgba(255,255,255,0.3);">
                {data['person']}
            </div>
        </div>
    """
    canvas_html += card_content

canvas_html += '</div>'

st.markdown(canvas_html, unsafe_allow_html=True)

st.markdown("---")
st.info("💡 **Como montar a hierarquia:** Selecione um cargo e escolha o seu 'Superior Direto'. Uma linha pontilhada aparecerá ligando os dois. Ajuste o Eixo X e Y para alinhar visualmente os departamentos.")
