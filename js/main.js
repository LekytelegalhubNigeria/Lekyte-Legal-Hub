// ===============================
// SUPABASE SETUP (SAFE VERSION)
// ===============================

const SUPABASE_URL = "https://kfsklphutaadklugqxut.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc2tscGh1dGFhZGtsdWdxeHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTMwMjksImV4cCI6MjA5MzM4OTAyOX0.UXFjp6_ippy4IA_xlfv1q3JtvIHd03wRIpxG-pP1h84";


window.addEventListener("error", function (e) {
  console.error("Global Error:", e.message);
});
// WhatsApp must NOT include "+"
const WA_PHONE_NUMBER = "2347025424135";

let supabaseClient = null;

// Initialize Supabase safely
function initSupabase() {

  if (supabaseClient) return;

  if (window.supabase && window.supabase.createClient) {

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    console.log("Supabase initialized");

  } else {

    console.warn("Supabase library not loaded yet");

  }

}

window.addEventListener("load", () => {
  initSupabase();
});

// ===============================
// PAGE NAVIGATION
// ===============================

window.showPage = function (pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  const selectedPage = document.getElementById(pageId);

  if (!selectedPage) {
    console.warn("Page not found:", pageId);
    return;
  }

  selectedPage.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });

  const navMenu = document.getElementById("navMenu");
  if (navMenu) navMenu.classList.remove("show");

  if (pageId === "properties") {
    loadProperties();
  }
};

// ===============================
// MOBILE MENU
// ===============================

window.toggleMobileMenu = function () {
  const navMenu = document.querySelector(".nav-links");
  if (navMenu) navMenu.classList.toggle("show");
};

// ===============================
// BACK TO TOP BUTTON
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const backToTop = document.getElementById("backToTop");
  if (!backToTop) return;

  // Show/hide on scroll using the .show class
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });

  // Smooth scroll to top on click
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// ===============================
// PROPERTY VALUATION
// ===============================

window.calculateValue = function (event) {
  event.preventDefault();

  const type = document.getElementById("propType")?.value;
  const location = document.getElementById("propLocation")?.value;
  const size = parseInt(document.getElementById("propSize")?.value || 0);
  const docs = document.getElementById("propDocs")?.value;

  let basePrice = 10000;

  if (type === "land") basePrice = 15000;
  if (type === "bungalow") basePrice = 45000;
  if (type === "duplex") basePrice = 80000;
  if (type === "flat") basePrice = 50000;
  if (type === "commercial") basePrice = 120000;

  let multiplier = 1;

  if (location === "ajah") multiplier = 2.5;
  if (location === "abuja") multiplier = 3;
  if (location === "akure") multiplier = 1.4;

  let value = basePrice * size * multiplier;

  if (docs === "cofo") value += 5000000;
  if (docs === "deed") value += 1500000;
  if (docs === "survey") value += 700000;

  const result = document.getElementById("valuationResult");

  if (result) {
    result.innerHTML = `
      <div class="valuation-result-box">
        <h3>Estimated Property Value</h3>
        <h2>₦${value.toLocaleString()}</h2>
        <p>This is an estimated market value.</p>
      </div>
    `;
  }
};

// ===============================
// LOAD PROPERTIES
// ===============================

async function loadProperties() {
  if (!supabaseClient) initSupabase();
  if (!supabaseClient) return;

  const grid = document.getElementById("propertiesGrid");
  if (!grid) return;

  grid.innerHTML = `<div class="empty-state"><h3>Loading Properties...</h3></div>`;

  try {
    const { data, error } = await supabaseClient
      .from("properties")
      .select("*")
      .eq("status", "verified")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      // Show sample advert when no properties exist
      grid.innerHTML = renderPropertyCard(sampleProperty);
      return;
    }

    grid.innerHTML = data.map(renderPropertyCard).join("");
  } catch (error) {
    console.error("Error loading properties:", error);
    // Show sample even if DB fails
    grid.innerHTML = renderPropertyCard(sampleProperty);
  }
}
// ===============================
// SAMPLE PROPERTY FOR ADVERT
// ===============================

const sampleProperty = {
  id: "sample-001",
  title: "3 Plots of Land with Uncompleted Building - Akure, Ondo State",
  description: "3 plots of land with an uncompleted building. Verified by Lekyte Legal Hub team. Good for completion or investment.",
  price: 150000000,  // 150,000,000.00 naira
  location: "Akure, Ondo State",
  type: "land",
  bedrooms: 0,
  bathrooms: 0,
  size: 3600,  // approximate for 3 plots, adjust if you know the exact sqm
  whatsapp: WA_PHONE_NUMBER,
  status: "verified",
  images: [
    "images/property1.jpg",
    "images/property2.jpg", 
    "images/property3.jpg",
    "images/property4.jpg"
  ],
  video_url: "videos/property-video.mp4",
  agent_name: "Lekyte Legal Hub"
};

// ===============================
// FILTER PROPERTIES
// ===============================

window.filterProperties = async function () {
  if (!supabaseClient) return;
  const type = document.getElementById("propertyType")?.value;
  const location = document.getElementById("propertyLocation")?.value;
  const grid = document.getElementById("propertiesGrid");
  if (!grid) return;

  grid.innerHTML = `<div class="empty-state"><h3>Searching Properties...</h3></div>`;

  try {
    let query = supabaseClient.from("properties").select("*").eq("status", "verified");
    if (type && type !== "all") query = query.eq("type", type);
    if (location && location !== "all") query = query.ilike("location", `%${location}%`);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    if (!data || data.length === 0) {
      grid.innerHTML = renderPropertyCard(sampleProperty);
      return;
    }

    grid.innerHTML = data.map(renderPropertyCard).join("");
  } catch (error) {
    console.error("Filter error:", error);
    grid.innerHTML = renderPropertyCard(sampleProperty);
  }
};

// ===============================
// RENDER PROPERTY CARD
// ===============================

function escapeJS(str = "") {
  return String(str).replace(/'/g, "\\'");
}

function renderPropertyCard(property) {
  const phone = property.whatsapp || WA_PHONE_NUMBER;
  const images = property.images || [property.image_url || "images/property1.jpg"];
  const video = property.video_url || null;

  // Build image gallery HTML
  const galleryHTML = images.map((img, index) => `
    <img src="${img}" alt="${property.title} ${index + 1}"
         loading="lazy"
         class="${index === 0? 'active' : ''}"
         onclick="changePropertyImage(this)">
  `).join('');

  return `
    <div class="property-card">
      <div class="property-card-header">
        <img src="images/agent1.jpg" alt="Agent" loading="lazy">
        <div class="meta">
          <h4>${property.agent_name || 'Lekyte Legal Hub'}</h4>
          <span>Verified • ${property.location || 'Nigeria'}</span>
        </div>
      </div>

      <div class="property-card-media">
        ${video? `
          <video controls preload="metadata" poster="${images[0]}" class="property-video">
            <source src="${video}" type="video/mp4">
            Your browser does not support video.
          </video>
        ` : ''}

        <div class="property-gallery">
          <div class="gallery-main">
            <img src="${images[0]}" alt="${property.title}" id="mainImg-${property.id}">
          </div>
          <div class="gallery-thumbs">
            ${galleryHTML}
          </div>
        </div>
      </div>

      <div class="property-card-body">
        <div class="price">₦${Number(property.price || 0).toLocaleString()}</div>
        <h4>${property.title || 'Property'}</h4>
        <p>${property.description || ''}</p>
        <div class="property-meta">
          <span><i class="fas fa-bed"></i> ${property.bedrooms || 0} Beds</span>
          <span><i class="fas fa-bath"></i> ${property.bathrooms || 0} Baths</span>
          <span><i class="fas fa-ruler-combined"></i> ${property.size || 0} sqm</span>
        </div>
      </div>

      <div class="property-card-actions">
        <button onclick="window.open('https://wa.me/${phone}?text=Hello, I am interested in ${encodeURIComponent(property.title)}')">
          <i class="fas fa-phone"></i> Contact
        </button>

        <button onclick="shareProperty('${property.id}')">
          <i class="fas fa-share"></i> Share
        </button>

        <button>
          <i class="fas fa-shield-alt"></i> Verified
        </button>
      </div>
    </div>
  `;
}

// Switch gallery image when thumbnail is clicked
window.changePropertyImage = function(thumb) {
  const gallery = thumb.closest('.property-gallery');

if (!gallery) return;

const mainImg = gallery.querySelector('.gallery-main img');

if (!mainImg) return;
  mainImg.src = thumb.src;

  gallery.querySelectorAll('.gallery-thumbs img').forEach(img => img.classList.remove('active'));
  thumb.classList.add('active');
};

// ===============================
// SHARE PROPERTY (FIXED)
// ===============================

window.shareProperty = function (id = "") {

  const base = window.location.origin + window.location.pathname;

  const url = id
    ? `${base}?property=${id}`
    : base;

  const text =
    `Check this verified property on Lekyte Legal Hub: ${url}`;

  if (navigator.share) {
    navigator.share({
  title: "Lekyte Legal Hub",
  text: text,
  url: url
});
  } else {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`
    );
  }
};

// ===============================
// AGENT LOGOUT
// ===============================

window.agentLogout = async function () {
  try {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }

    alert("Logged out successfully");
    showPage("home");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// ===============================
// INIT CHECK
// ===============================

document.addEventListener("DOMContentLoaded", async () => {
  initSupabase();

  try {
    if (supabaseClient) {
      const { data } = await supabaseClient.auth.getSession();
      console.log("Supabase Ready", data?.session ? "Logged in" : "Guest");
    }
  } catch (error) {
    console.error("Init error:", error);
  }
});
// ===============================
// AUTH: SIGNUP / LOGIN / LOGIN CHECK
// ===============================

// Signup Handler
window.handleSignUp = async function (e) {
  e.preventDefault();
  
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const statusEl = document.getElementById('authMessage');

  if (!email || !password) {
    if (statusEl) {
      statusEl.textContent = 'Please fill all fields';
      statusEl.style.color = 'red';
    }
    return;
  }

  if (statusEl) {
    statusEl.textContent = 'Creating account...';
    statusEl.style.color = 'gray';
  }

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo:
  "https://lekytelegalhubnigeria.github.io/Lekyte-Legal-Hub/"
      }
    });

    if (error) throw error;
	// SAVE AGENT DETAILS TO DATABASE
const user = data.user;

if (user) {

  const { error: insertError } = await supabaseClient
    .from('agents')
    .insert([
      {
        id: user.id,
        full_name: document.getElementById('agentName').value,
        phone: document.getElementById('agentPhone').value,
        email: email,
        cac_number: document.getElementById('agentCAC').value,
        esvarbon_id: document.getElementById('agentESV').value,
        state: document.getElementById('agentState').value,
        status: "pending"
      }
    ]);

  if (insertError) {
    console.error(insertError);
  }
}

    if (statusEl) {
      statusEl.textContent = 'Check your email to confirm your account';
      statusEl.style.color = 'green';
    }

    form.reset();

    // Only redirect after 2 seconds so user sees the message
    setTimeout(() => showPage('agentDashboard'), 2000);

  } catch (error) {
    console.error('Signup error:', error);
    if (statusEl) {
      statusEl.textContent = error.message;
      statusEl.style.color = 'red';
    }
  }
};

// Login Handler
window.handleLogin = async function (e) {
  e.preventDefault();
  
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value.trim();
  const statusEl = document.getElementById('authMessage');

  if (!email || !password) {
    if (statusEl) {
      statusEl.textContent = 'Please fill all fields';
      statusEl.style.color = 'red';
    }
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    if (statusEl) {
      statusEl.textContent = 'Logged in successfully';
      statusEl.style.color = 'green';
    }

    showPage('agentDashboard');
checkIfAdmin(); // change to your dashboard page ID

  } catch (error) {
    console.error('Login error:', error);
    if (statusEl) {
      statusEl.textContent = error.message;
      statusEl.style.color = 'red';
    }
  }
};

// ===============================
// DEEP LINK (SHARED PROPERTY OPEN)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);

  const propertyId = params.get("property");

  if (propertyId) {
    openSharedProperty(propertyId);
  }

});


function openSharedProperty(id) {
  if (!supabaseClient) {
  initSupabase();
}

if (!supabaseClient) {
  console.error("Supabase not ready");
  return;
}

  const grid = document.getElementById("propertiesGrid");
  if (!grid) return;

  grid.innerHTML = `<div class="empty-state"><h3>Loading Property...</h3></div>`;

  supabaseClient
    .from("properties")
    .select("*")
    .eq("id", id)
    .single()
    .then(({ data, error }) => {
      if (error || !data) {
        grid.innerHTML = `<div class="empty-state"><h3>Property not found</h3></div>`;
        return;
      }

      grid.innerHTML = renderPropertyCard(data);

      // Auto-open properties page if not already there
      showPage("properties");
    });
}

// ===============================
// ADMIN CHECK SYSTEM
// ===============================

let isAdmin = false;

async function checkIfAdmin() {

  if (!supabaseClient) initSupabase();

  if (!supabaseClient) return;

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {
    console.log("No logged in user");
    return;
  }

  const { data, error } = await supabaseClient
    .from("admin_users")
    .select("*")
    .eq("id", user.id);

  if (error) {
    console.error(error);
    return;
  }

  if (data && data.length > 0) {

    isAdmin = true;

    console.log("Admin access granted");

    loadAdminDashboard();

  } else {

    isAdmin = false;

    console.log("Not admin");

  }

  if (data && data.length > 0) {
    isAdmin = true;
    console.log("Admin access granted");
    loadAdminDashboard();
  } else {
    isAdmin = false;
    console.log("Not admin");
  }
}

async function loadAdminDashboard() {
  const adminPanel = document.getElementById("adminPanel");
  if (!adminPanel) return;

  adminPanel.innerHTML = `<h3>Loading Agents...</h3>`;

  const { data, error } = await supabaseClient
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    adminPanel.innerHTML = "Error loading agents";
    return;
  }

  adminPanel.innerHTML = data.map(renderAdminAgentCard).join("");
}

function renderAdminAgentCard(agent) {
  return `
    <div class="admin-card">
      <h4>${agent.full_name}</h4>
      <p>${agent.email}</p>
      <p>${agent.phone}</p>
      <p>Status: <b>${agent.status}</b></p>

      <button onclick="approveAgent('${agent.id}')">Approve</button>
      <button onclick="rejectAgent('${agent.id}')">Reject</button>
    </div>
  `;
}


async function loadUserRole(userId) {
  const { data } = await supabaseClient
    .from('profiles')
    .select('status')
    .eq('id', userId)
    .single();

  return data.status;
}

async function loadAgents() {
  const { data, error } = await supabaseClient
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
    return;
  }

  renderAgents(data);
  updateStats(data);
}

function renderAgents(agents) {
  const list = document.getElementById("agentsList");
  list.innerHTML = "";

  agents.forEach(agent => {
    const div = document.createElement("div");
    div.className = "agent-item";

    div.innerHTML = `
      <div>
        <strong>${agent.full_name || "No Name"}</strong><br>
        <small>${agent.email || ""}</small><br>
        <small>Status: ${agent.status}</small>
      </div>

      <div class="agent-actions">
        <button class="approve-btn" onclick="approveAgent('${agent.id}')">Approve</button>
        <button class="reject-btn" onclick="rejectAgent('${agent.id}')">Reject</button>
        <button class="delete-btn" onclick="deleteAgent('${agent.id}')">Delete</button>
      </div>
    `;

    list.appendChild(div);
  });
}

function updateStats(agents) {
  const totalAgents = document.getElementById("totalAgents");

if (totalAgents) {
  totalAgents.innerText = agents.length;
}

  const pending = agents.filter(a => a.status === "pending").length;
  const approved = agents.filter(a => a.status === "agent").length;

  const pendingEl = document.getElementById("pendingAgents");
const approvedEl = document.getElementById("approvedAgents");

if (pendingEl) {
  pendingEl.innerText = pending;
}

if (approvedEl) {
  approvedEl.innerText = approved;
}

async function approveAgent(id) {
  const { error } = await supabaseClient
    .from("agents")
    .update({ status: "agent" })
    .eq("id", id);

  if (error) {
    alert("Error approving agent");
  } else {
    loadAgents();
  }
}

async function rejectAgent(id) {
  const { error } = await supabaseClient
    .from("agents")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    alert("Error rejecting agent");
  } else {
    loadAgents();
  }
}

async function deleteAgent(id) {
  const confirmDelete = confirm("Are you sure you want to delete this agent?");
  if (!confirmDelete) return;

  const { error } = await supabaseClient
    .from("agents")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Delete failed");
  } else {
    loadAgents();
  }
}

async function checkAdminAccess(userId) {
  const { data } = await supabaseClient
    .from("agents")
    .select("status")
    .eq("id", userId)
    .single();

  if (data.status === "admin") {
    document.getElementById("adminPanel").style.display = "block";
    loadAgents();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await checkIfAdmin();
});

}