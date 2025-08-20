
(function(){
  const KEY = 'supermart_cart_v1';

  function getCart(){
    try{ return JSON.parse(localStorage.getItem(KEY)) || []; }catch(e){ return []; }
  }
  function saveCart(items){ localStorage.setItem(KEY, JSON.stringify(items)); }

  function countCart(){
    return getCart().reduce((sum,i)=> sum + (i.qty||1), 0);
  }

  function updateCartPill(){
    const countEl = document.getElementById('cartCount');
    if(countEl){ countEl.textContent = String(countCart()); }
  }

  function disableCartIfEmptyOnIndex(){
    const isIndex = document.body.dataset.page === 'index';
    if(!isIndex) return;
    const cartLink = document.getElementById('cartLink');
    if(!cartLink) return;
    const empty = countCart() === 0;
    cartLink.setAttribute('aria-disabled', empty ? 'true' : 'false');
    if(empty){
      cartLink.title = 'Add a product to access your cart.';
    }else{
      cartLink.removeAttribute('title');
    }
  }

  function addToCart(payload){
    const items = getCart();
    const idx = items.findIndex(p=> p.id === payload.id);
    if(idx>-1){
      items[idx].qty += 1;
    }else{
      items.push({...payload, qty:1});
    }
    saveCart(items);
    updateCartPill();
    disableCartIfEmptyOnIndex();
  }

  function removeFromCart(id){
    const items = getCart().filter(p=> p.id !== id);
    saveCart(items);
    updateCartPill();
  }

  function changeQty(id, delta){
    const items = getCart();
    const idx = items.findIndex(p=> p.id === id);
    if(idx>-1){
      items[idx].qty = Math.max(1, (items[idx].qty||1) + delta);
      saveCart(items);
      updateCartPill();
    }
  }

  // Wire Add buttons
  document.addEventListener('click', function(e){
    const btn = e.target.closest('[data-add]');
    if(btn){
      const payload = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price||'0'),
        img: btn.dataset.img
      };
      addToCart(payload);
      btn.textContent = 'Added ✓';
      setTimeout(()=>{ btn.textContent = 'Add to Cart'; }, 1000);
    }
  });

  // Render cart table if present
  function renderCartTable(){
    const table = document.getElementById('cartTable');
    const emptyBox = document.getElementById('emptyCart');
    if(!table && !emptyBox) return;
    const items = getCart();
    if(items.length === 0){
      if(emptyBox) emptyBox.style.display = 'block';
      if(table) table.style.display = 'none';
      updateCartPill();
      return;
    }
    if(emptyBox) emptyBox.style.display = 'none';
    if(table){
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';
      let total = 0;
      for(const it of items){
        const line = it.price * (it.qty||1);
        total += line;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="display:flex;align-items:center;gap:10px">
            <img src="${it.img}" alt="" style="width:60px;height:40px;object-fit:cover;border:1px solid #e5e7eb;border-radius:8px">
            ${it.name}
          </td>
          <td>R ${it.price.toFixed(2)}</td>
          <td>
            <button class="btn ghost" data-qtyminus data-id="${it.id}">-</button>
            <span style="padding:0 10px">${it.qty||1}</span>
            <button class="btn ghost" data-qtyplus data-id="${it.id}">+</button>
          </td>
          <td>R ${line.toFixed(2)}</td>
          <td><button class="btn alt" data-remove data-id="${it.id}">Remove</button></td>
        `;
        tbody.appendChild(tr);
      }
      const totalEl = document.getElementById('grandTotal');
      if(totalEl) totalEl.textContent = 'R ' + total.toFixed(2);
    }
  }

  document.addEventListener('click', function(e){
    const rm = e.target.closest('[data-remove]');
    if(rm){ removeFromCart(rm.dataset.id); renderCartTable(); }
    const qplus = e.target.closest('[data-qtyplus]');
    if(qplus){ changeQty(qplus.dataset.id, +1); renderCartTable(); }
    const qminus = e.target.closest('[data-qtyminus]');
    if(qminus){ changeQty(qminus.dataset.id, -1); renderCartTable(); }
  });

  document.addEventListener('DOMContentLoaded', function(){
    updateCartPill();
    disableCartIfEmptyOnIndex();
    renderCartTable();
    // Mark active nav link
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a=>{
      const href = a.getAttribute('href');
      if(href === path){ a.classList.add('active'); }
    });
  });
})();
