// --- THREE.JS 3D GLOWING GLOBE & ORBITING AGENT NODES ---
let scene, camera, renderer, globe, particleSystem;
let orbitingNodes = [];
let globeVisible = true,
	globeRaf = 0,
	globeW = 0,
	globeH = 0;
const IS_MOBILE = window.matchMedia("(max-width: 1024px)").matches;

function init3DGlobe() { 
	const container = document.getElementById("canvas-container");
	if (!container || typeof THREE === "undefined") return;
	const width = container.clientWidth;
	const height = container.clientHeight;
	globeW = width;
	globeH = height;

	// Scene setup
	scene = new THREE.Scene();

	// Camera setup
	camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
	camera.position.z = 7.5;

	// Renderer setup
	renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: !IS_MOBILE,
		powerPreference: "high-performance",
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, IS_MOBILE ? 1.5 : 2));
	renderer.setSize(width, height);
	container.appendChild(renderer.domElement);

	// 1. Core Sphere (Dark Wireframe & Crimson Glowing Mesh)
	const globeGeo = new THREE.SphereGeometry(2.2, IS_MOBILE ? 28 : 36, IS_MOBILE ? 28 : 36);
	const globeMat = new THREE.MeshBasicMaterial({
		color: 0xff2a4d,
		wireframe: true,
		transparent: true,
		opacity: 0.25,
	});
	globe = new THREE.Mesh(globeGeo, globeMat);
	scene.add(globe);

	// Inner Core Light Glow
	const innerCoreGeo = new THREE.SphereGeometry(1.8, IS_MOBILE ? 18 : 24, IS_MOBILE ? 18 : 24);
	const innerCoreMat = new THREE.MeshBasicMaterial({
		color: 0x80001a,
		transparent: true,
		opacity: 0.5,
	});
	const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
	scene.add(innerCore);

	// 2. Ambient Particles / Energy Streams
	const particleCount = IS_MOBILE ? 320 : 600;
	const geometry = new THREE.BufferGeometry();
	const positions = new Float32Array(particleCount * 3);

	for (let i = 0; i < particleCount * 3; i += 3) {
		positions[i] = (Math.random() - 0.5) * 8;
		positions[i + 1] = (Math.random() - 0.5) * 8;
		positions[i + 2] = (Math.random() - 0.5) * 8;
	}

	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	const pMaterial = new THREE.PointsMaterial({
		color: 0xff0033,
		size: 0.035,
		transparent: true,
		opacity: 0.7,
	});
	particleSystem = new THREE.Points(geometry, pMaterial);
	scene.add(particleSystem);

	// 3. Orbiting Active Agent Spheres
	const agentNames = [
		"Lead Qualifier",
		"Support Bot",
		"Data Parser",
		"Workflow Exec",
		"CRM Sync",
		"Voice AI",
	];
	const orbitRadius = 3.2;

	agentNames.forEach((name, idx) => {
		const angle = (idx / agentNames.length) * Math.PI * 2;

		// Agent Mesh Node
		const nodeGeo = new THREE.SphereGeometry(0.12, 12, 12);
		const nodeMat = new THREE.MeshBasicMaterial({ color: 0xff2a4d });
		const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);

		// Add to scene
		scene.add(nodeMesh);

		orbitingNodes.push({
			mesh: nodeMesh,
			angle: angle,
			speed: 0.008 + idx * 0.002,
			radius: orbitRadius,
			name: name,
		});
	});

	// Lights
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
	scene.add(ambientLight);

	// Handle window resize (debounced)
	let rt;
	window.addEventListener("resize", () => {
		clearTimeout(rt);
		rt = setTimeout(onWindowResize, 150);
	});

	// Only render while the globe is on screen and the tab is visible
	if ("IntersectionObserver" in window) {
		new IntersectionObserver(
			(es) => {
				globeVisible = es[0].isIntersecting;
				startGlobe();
			},
			{ rootMargin: "80px" },
		).observe(container);
	}
	document.addEventListener("visibilitychange", startGlobe);
	startGlobe();
}

function startGlobe() {
	const run = globeVisible && !document.hidden;
	if (run && !globeRaf) globeRaf = requestAnimationFrame(animate);
	if (!run && globeRaf) {
		cancelAnimationFrame(globeRaf);
		globeRaf = 0;
	}
}

function animate() {
	globeRaf = requestAnimationFrame(animate);

	// Rotate main central globe
	if (globe) {
		globe.rotation.y += 0.004;
		globe.rotation.x += 0.001;
	}

	if (particleSystem) {
		particleSystem.rotation.y -= 0.002;
	}

	// Update orbiting agent positions
	orbitingNodes.forEach((node) => {
		node.angle += node.speed;
		node.mesh.position.x = Math.cos(node.angle) * node.radius;
		node.mesh.position.z = Math.sin(node.angle) * node.radius;
		node.mesh.position.y = Math.sin(node.angle * 2) * 0.5;
	});

	renderer.render(scene, camera);
}

function onWindowResize() {
	const container = document.getElementById("canvas-container");
	if (!container || !renderer) return;
	const width = container.clientWidth;
	const height = container.clientHeight;
	// mobile address-bar show/hide fires resize often: skip if nothing changed
	if (width === globeW && height === globeH) return;
	globeW = width;
	globeH = height;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
}

// Initialize 3D Engine on load
window.addEventListener("load", function () {
	// let the first paint + intro finish before starting the heavy WebGL work
	const boot = () => {
		init3DGlobe();
		startTerminalStream();
		initRoiCalculator();
	};
	if ("requestIdleCallback" in window) requestIdleCallback(boot, { timeout: 1200 });
	else setTimeout(boot, 200);
});

// --- TERMINAL STREAM SIMULATOR ---
function startTerminalStream() {
	const terminal = document.getElementById("terminal-logs");
	const logs = [
		"EXEC: Lead Qualifier parsed payload #9481 -> Score: 98/100",
		"VOICE_AI: Active stream established with customer +1 (555) 392-10",
		"SYNC: HubSpot CRM record updated for user_id #8841",
		"AUDIT: Telemetry ping verified. Encrypted payload OK",
		"MODEL: GPT-4o inference completed in 142ms",
		"FLOW: Workflow step #03 triggered successfully.",
	];

	setInterval(() => {
		if (terminal && !document.hidden) {
			const randomLog = logs[Math.floor(Math.random() * logs.length)];
			const time = new Date().toLocaleTimeString("en-US", { hour12: false });
			const p = document.createElement("p");
			p.className = "text-slate-300";
			p.innerHTML = `<span class="text-laxa-red">[${time}]</span> ${randomLog}`;
			terminal.appendChild(p);
			terminal.scrollTop = terminal.scrollHeight;
			if (terminal.children.length > 20) {
				terminal.removeChild(terminal.firstChild);
			}
		}
	}, 2500);
}

// --- WORKFLOW SIMULATOR ---
function runWorkflowSim() {
	const node2 = document.getElementById("sim-node-2");
	const node3 = document.getElementById("sim-node-3");
	const node4 = document.getElementById("sim-node-4");
	const status = document.getElementById("sim-status");

	status.innerText = "Status: Running active execution pipeline...";
	status.className = "text-laxa-red font-mono animate-pulse";

	setTimeout(() => {
		node2.classList.add(
			"border-laxa-red",
			"shadow-[0_0_20px_rgba(255,42,77,0.5)]",
		);
	}, 600);

	setTimeout(() => {
		node3.classList.add(
			"border-laxa-red",
			"shadow-[0_0_20px_rgba(255,42,77,0.5)]",
		);
	}, 1400);

	setTimeout(() => {
		node4.classList.add(
			"border-laxa-red",
			"shadow-[0_0_20px_rgba(255,42,77,0.5)]",
		);
		status.innerText =
			"Status: Workflow execution succeeded (184ms total latency)";
		status.className = "text-emerald-400 font-mono";
	}, 2200);
}

function resetWorkflowSim() {
	["sim-node-2", "sim-node-3", "sim-node-4"].forEach((id) => {
		const el = document.getElementById(id);
		if (el) {
			el.classList.remove(
				"border-laxa-red",
				"shadow-[0_0_20px_rgba(255,42,77,0.5)]",
			);
		}
	});
	const status = document.getElementById("sim-status");
	status.innerText = "Status: Ready for simulation";
	status.className = "text-slate-400 font-mono";
}

// --- DYNAMIC ROI CALCULATOR ---
function initRoiCalculator() {
	const teamSlider = document.getElementById("team-slider");
	const rateSlider = document.getElementById("rate-slider");

	const teamVal = document.getElementById("team-val");
	const rateVal = document.getElementById("rate-val");
	const roiSavings = document.getElementById("roi-savings");
	const roiHours = document.getElementById("roi-hours");

	function updateROI() {
		const team = parseInt(teamSlider.value);
		const rate = parseInt(rateSlider.value);

		teamVal.innerText = `${team} Employees`;
		rateVal.innerText = `$${rate} / hr`;

		// Calculate savings (approx 250 working hours saved per employee annually via automation)
		const hoursSaved = team * 250;
		const totalSavings = hoursSaved * rate;

		roiHours.innerText = `${hoursSaved.toLocaleString()} hrs`;
		roiSavings.innerText = `$${totalSavings.toLocaleString()}`;
	}

	teamSlider.addEventListener("input", updateROI);
	rateSlider.addEventListener("input", updateROI);
	updateROI();
}

// --- DIAGNOSTICS MODAL ---
function toggleAgentLogModal() {
	const modal = document.getElementById("log-modal");
	if (modal.classList.contains("hidden")) {
		modal.classList.remove("hidden");
		modal.classList.add("flex");
	} else {
		modal.classList.add("hidden");
		modal.classList.remove("flex");
	}
}

// --- MULTI-AGENT ROLES ---
const AGENT_ROLES = {
	planner: {
		icon: "fa-sitemap",
		title: "Planner Agent",
		desc: "Breaks a goal into clear steps and decides which agent handles each one.",
		steps: [
			"Reads the request and context",
			"Builds a step-by-step plan",
			"Assigns steps to other agents",
		],
	},
	researcher: {
		icon: "fa-magnifying-glass-chart",
		title: "Researcher Agent",
		desc: "Collects the facts the plan needs from your knowledge base, CRM and the web.",
		steps: [
			"Searches approved sources",
			"Pulls the relevant passages",
			"Returns findings with sources",
		],
	},
	executor: {
		icon: "fa-gears",
		title: "Executor Agent",
		desc: "Carries out the plan by calling tools such as email, CRM, calendar and databases.",
		steps: [
			"Calls only approved tools",
			"Writes results back to your systems",
			"Reports each completed step",
		],
	},
	reviewer: {
		icon: "fa-user-check",
		title: "Reviewer Agent",
		desc: "Checks the output against your rules and asks for a human when confidence is low.",
		steps: [
			"Checks quality and policy",
			"Sends fixes back to the team",
			"Escalates risky actions to a person",
		],
	},
};

function selectRole(key) {
	const r = AGENT_ROLES[key];
	const panel = document.getElementById("role-panel");
	if (!r || !panel) return;
	document
		.querySelectorAll(".role-btn")
		.forEach((b) => b.classList.remove("border-laxa-red", "bg-laxa-red/10"));
	const active = document.getElementById("role-btn-" + key);
	if (active) active.classList.add("border-laxa-red", "bg-laxa-red/10");
	panel.innerHTML = `<div class="flex items-center gap-3 mb-4"><span class="w-12 h-12 rounded-2xl bg-laxa-red/20 border border-laxa-red/40 text-laxa-red flex items-center justify-center text-xl"><i class="fa-solid ${r.icon}"></i></span><h3 class="font-heading font-bold text-2xl text-white">${r.title}</h3></div><p class="text-slate-300 text-sm leading-relaxed">${r.desc}</p><ol class="mt-6 space-y-3">${r.steps.map((s, i) => `<li class="flex items-center gap-3 text-sm text-slate-200"><span class="w-6 h-6 rounded-full bg-laxa-red/20 text-laxa-red text-xs font-mono flex items-center justify-center">${i + 1}</span>${s}</li>`).join("")}</ol>`;
}

// --- RAG DEMO (sample data only) ---
const RAG_DEMO = [
	{
		q: "What is the refund policy?",
		a: "Refunds are available within 30 days of purchase for unused services.",
		src: "refund-policy.pdf · p.2",
	},
	{
		q: "How do I reset SSO?",
		a: "Open Admin > Security > SSO, choose Reset connection, then re-enter your identity provider details.",
		src: "admin-guide.md · Security",
	},
	{
		q: "Who approves discounts?",
		a: "Discounts above 10% need approval from the sales manager.",
		src: "sales-playbook.docx · Pricing",
	},
];

function askRag(i) {
	const chat = document.getElementById("rag-chat");
	const d = RAG_DEMO[i];
	if (!chat || !d) return;
	chat.innerHTML = `<p class="text-right"><span class="inline-block bg-laxa-red/20 border border-laxa-red/30 text-white rounded-2xl px-3 py-2">${d.q}</span></p><p class="text-slate-500 font-mono animate-pulse" id="rag-think">Searching knowledge base...</p>`;
	setTimeout(() => {
		const t = document.getElementById("rag-think");
		if (t)
			t.outerHTML = `<div class="laxa-glass rounded-2xl px-3 py-3 border border-white/10"><p class="text-slate-200 leading-relaxed">${d.a}</p><span class="inline-block mt-2 text-[10px] font-mono text-laxa-red bg-laxa-red/10 border border-laxa-red/30 px-2 py-0.5 rounded-full"><i class="fa-solid fa-link mr-1"></i>${d.src}</span></div>`;
	}, 900);
}

document.addEventListener("DOMContentLoaded", () => selectRole("planner"));

// ===== CONFIG: put your real WhatsApp number (country code, digits only) =====
const WHATSAPP_NUMBER = "923091491289"; // +92 309 1491289
const WA_TEXT =
	"Hello LAXA AI, I want to know more about your AI automation services.";
const waLink = (t = WA_TEXT) =>
	`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t)}`;

function submitContact(e) {
	e.preventDefault();
	const v = (id) => document.getElementById(id).value.trim();
	window.open(
		waLink(
			`Hi LAXA AI! I'm ${v("c-name")} (${v("c-email")}). Plan: ${v("c-plan")}. ${v("c-msg")}`,
		),
		"_blank",
		"noopener",
	);
}

function toggleMenu() {
	document.getElementById("mobile-menu").classList.toggle("hidden");
}

// ===== LEGAL MODAL (template text - have it reviewed before launch) =====
const LEGAL = {
	privacy: [
		"Privacy Policy",
		[
			"We collect only the information you send us through the contact form or WhatsApp, and use it to reply to you.",
			"We do not sell personal data. Messages you send via WhatsApp are handled under WhatsApp's own terms.",
			"Contact us to request access to or deletion of your data.",
		],
	],
	terms: [
		"Terms & Conditions",
		[
			"By using this website and our services you agree to these terms. Services are delivered as agreed in a written proposal.",
			"Pricing shown is indicative and may change by project scope. Third-party tools and APIs are subject to their own terms.",
			"All content on this site is owned by LAXA AI. All rights reserved.",
		],
	],
	security: [
		"Security Policy",
		[
			"Data is encrypted in transit. Access is role-based and agent actions are logged for audit.",
			"Sensitive data can be masked before it reaches an AI model, and risky actions can require human approval.",
			"To report a security concern, contact us on WhatsApp or LinkedIn.",
		],
	],
};
function openLegal(k) {
	const [t, ps] = LEGAL[k];
	document.getElementById("legal-title").textContent = t;
	document.getElementById("legal-body").innerHTML =
		ps.map((p) => `<p>${p}</p>`).join("") +
		'<p class="text-[10px] font-mono text-amber-300">Template text. Review with a legal professional before publishing.</p>';
	const m = document.getElementById("legal-modal");
	m.classList.remove("hidden");
	m.classList.add("flex");
}
function closeLegal() {
	const m = document.getElementById("legal-modal");
	m.classList.add("hidden");
	m.classList.remove("flex");
}

// ===== SOCIAL LINKS (edit these) =====
const SOCIAL = {
	linkedin: "https://www.linkedin.com/in/ali-shanawar-4176623ba/",
	instagram: "https://www.instagram.com/xavanxai/",
	youtube: "https://www.youtube.com/", // TODO: your channel URL
	facebook: "https://www.facebook.com/", // TODO: your page URL
};

// ===== AGENT TEMPLATE STORE: add / edit your templates here =====
// link: optional purchase URL (Gumroad, Stripe...). If empty, the button opens WhatsApp.
const AGENT_TEMPLATES = [
	{
		name: "Lead Qualifier Agent",
		cat: "Sales",
		icon: "fa-bolt",
		desc: "Scores inbound leads and books meetings automatically.",
		price: "$149",
		link: "",
		sample: true,
	},
	{
		name: "WhatsApp Auto-Reply Bot",
		cat: "Support",
		icon: "fa-whatsapp fa-brands",
		desc: "Answers customer questions on WhatsApp 24/7.",
		price: "$99",
		link: "",
		sample: true,
	},
	{
		name: "Voice Receptionist Agent",
		cat: "Voice",
		icon: "fa-phone-volume",
		desc: "Answers calls, takes details and routes to your team.",
		price: "$139",
		link: "",
		sample: true,
	},
	{
		name: "Invoice Data Extractor",
		cat: "Data",
		icon: "fa-file-invoice",
		desc: "Reads invoices and sends structured data to your sheet or ERP.",
		price: "$99",
		link: "",
		sample: true,
	},
	{
		name: "Social Content Planner",
		cat: "Marketing",
		icon: "fa-bullhorn",
		desc: "Plans and drafts a week of social posts from your brief.",
		price: "$99",
		link: "",
		sample: true,
	},
	{
		name: "Knowledge Base Chatbot",
		cat: "Support",
		icon: "fa-book-open",
		desc: "Answers from your documents and cites the source.",
		price: "$149",
		link: "",
		sample: true,
	},
];
let tplCat = "All";
function renderTemplates() {
	const cats = ["All", ...new Set(AGENT_TEMPLATES.map((t) => t.cat))];
	document.getElementById("tpl-filters").innerHTML = cats
		.map(
			(c) =>
				`<button onclick="tplCat='${c}';renderTemplates()" class="px-4 py-2 rounded-xl text-xs font-semibold ${c === tplCat ? "bg-laxa-red text-white" : "laxa-glass text-slate-300 hover:bg-white/10"}">${c}</button>`,
		)
		.join("");
	const list = AGENT_TEMPLATES.filter(
		(t) => tplCat === "All" || t.cat === tplCat,
	);
	document.getElementById("tpl-grid").innerHTML = list
		.map(
			(t) =>
				`<div class="laxa-glass-red rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all"><div><div class="flex justify-between items-start mb-4"><div class="w-12 h-12 rounded-2xl bg-laxa-red/20 border border-laxa-red/40 flex items-center justify-center text-laxa-red text-xl"><i class="fa-solid ${t.icon}"></i></div><span class="text-[10px] font-mono text-slate-300 laxa-glass px-2.5 py-1 rounded-full">${t.cat.toUpperCase()}</span></div><h3 class="text-lg font-bold font-heading text-white">${t.name}</h3><p class="text-xs text-slate-400 mt-2 leading-relaxed">${t.desc}</p></div><div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-between"><span class="font-heading font-extrabold text-xl text-white">${t.price}${t.sample ? ' <span class="text-[9px] font-mono text-amber-300">SAMPLE</span>' : ""}</span><a href="${t.link || waLink("Hi LAXA AI, I want the template: " + t.name)}" target="_blank" rel="noopener" class="px-4 py-2 rounded-xl bg-laxa-red text-white text-xs font-bold hover:bg-laxa-redBright transition-all">Get Template</a></div></div>`,
		)
		.join("");
}

// ===== FAQ (also used by the voice agent) =====
const FAQS = [
	[
		"What does LAXA AI do?",
		"LAXA AI is an AI automation agency. We build AI agents, chatbots, voice agents and n8n workflow automations that handle tasks and customers around the clock.",
	],
	[
		"Where can the bots work?",
		"On your website, WhatsApp, phone calls, email and tools like Slack and your CRM, through integrations.",
	],
	[
		"Can you build a custom agent for my business?",
		"Yes. Tell us what you want to automate through the contact form or WhatsApp and we will design it with you.",
	],
	[
		"How does pricing work?",
		"We have four plans: Starter at 499 dollars a month, Growth at 899, Pro at 1,499, and a Custom cluster for private deployments.",
	],
	[
		"Is my data secure?",
		"Traffic is encrypted, sensitive data can be masked, access is role-based, actions are logged and risky actions can need human approval.",
	],
	[
		"How do I buy an agent template?",
		"Open the Template Store, choose a template and tap Get Template. You will be taken to the purchase link or to WhatsApp.",
	],
	[
		"How do I get started?",
		"Use the contact form or WhatsApp button. Share what you want to automate and we will reply with next steps.",
	],
];
function renderFaq() {
	document.getElementById("faq-list").innerHTML = FAQS.map(
		([q, a]) =>
			`<details class="laxa-glass rounded-2xl px-5 py-4 border border-white/10"><summary class="cursor-pointer font-heading font-bold text-white text-sm flex justify-between items-center gap-4">${q}<i class="fa-solid fa-plus text-laxa-red"></i></summary><p class="text-xs text-slate-400 mt-3 leading-relaxed">${a}</p></details>`,
	).join("");
}

// ===== THEME =====
function applyTheme(m) {
	document.documentElement.classList.toggle("light", m === "light");
	document.documentElement.classList.toggle("dark", m !== "light");
	const i = document.querySelector("#theme-btn i");
	if (i) i.className = "fa-solid " + (m === "light" ? "fa-sun" : "fa-moon");
}
function toggleTheme() {
	const m = document.documentElement.classList.contains("light")
		? "dark"
		: "light";
	try {
		localStorage.setItem("laxa-theme", m);
	} catch (e) {}
	applyTheme(m);
}

// ===== VOICE AGENT: knowledge of the whole website =====
// Optional: set to your backend URL that calls an LLM (POST {question, context} -> {answer}).
const VOICE_AI_ENDPOINT = "";
const tplList = () =>
	AGENT_TEMPLATES.map((t) => `${t.name} (${t.price})`).join(", ");
const VOICE_KB = [
	{
		k: ["hello", "hi", "hey", "salam", "assalam", "aoa", "good morning"],
		a: "Hello! I'm the LAXA AI voice agent. Ask me anything about our services, pricing, templates, security or how to start.",
		chips: 1,
	},
	{
		k: [
			"who are you",
			"what do you do",
			"about",
			"company",
			"agency",
			"laxa",
			"kya karte",
			"kon ho",
			"kaun",
			"introduce",
			"tell me about",
		],
		a: "LAXA AI is an AI automation agency. We build AI agents, chatbots, voice agents and n8n workflow automations that save time and serve customers 24/7. We also sell ready-made agent templates.",
		more: "Our work covers AI agents, website and WhatsApp chatbots, voice AI, workflow automation, RAG knowledge bots, CRM and lead automation, and custom integrations.",
		go: "#services",
	},
	{
		k: [
			"service",
			"offer",
			"provide",
			"what can you build",
			"build",
			"bana",
			"banate",
			"make bot",
		],
		a: "We build AI agents, website and WhatsApp chatbots, voice AI agents, n8n workflow automations, RAG knowledge bots, CRM and lead automation, and custom integrations.",
		go: "#services",
	},
	{
		k: ["chatbot", "chat bot", "bot", "website chat"],
		a: "We build chatbots for your website and WhatsApp that answer customers instantly, capture leads and hand over to your team when needed.",
		go: "#services",
	},
	{
		k: ["whatsapp bot", "whatsapp automation", "auto reply", "auto-reply"],
		a: "Our WhatsApp bots reply to customers automatically, answer from your knowledge base and can pass chats to a human. There is also a WhatsApp Auto-Reply template in the store.",
		go: "#templates",
	},
	{
		k: ["voice agent", "voice ai", "phone", "call", "receptionist", "calling"],
		a: "Voice AI agents talk to customers on calls, answer questions, collect details and hand over to a human when needed. A Voice Receptionist template is in the store.",
		go: "#marketplace",
	},
	{
		k: [
			"n8n",
			"workflow",
			"automation",
			"automate",
			"zapier",
			"make.com",
			"integration",
			"integrate",
		],
		a: "We build workflows, mostly with n8n, that connect your apps, data and AI steps so repetitive work runs by itself. You can try the live workflow simulator on this page.",
		go: "#workflows",
	},
	{
		k: ["rag", "knowledge", "document", "pdf", "own data", "train"],
		a: "Our RAG knowledge engine lets agents answer from your own documents and shows the source for each answer.",
		go: "#rag-engine",
	},
	{
		k: ["crm", "hubspot", "lead", "sales", "follow up", "follow-up"],
		a: "Lead and CRM agents capture, qualify and follow up leads, then update your CRM automatically.",
		go: "#marketplace",
	},
	{
		k: [
			"multi agent",
			"multi-agent",
			"orchestrat",
			"planner",
			"researcher",
			"reviewer",
		],
		a: "In a multi-agent system a Planner, Researcher, Executor and Reviewer agent work as a team on one goal, and a human can approve risky steps.",
		go: "#multi-agent",
	},
	{
		k: [
			"template",
			"ready made",
			"readymade",
			"ready-made",
			"store",
			"buy",
			"sell",
			"purchase",
		],
		a: () =>
			`Our Template Store has ready-made agents like ${tplList()}. Tap Get Template on any card to buy or ask us on WhatsApp.`,
		go: "#templates",
	},
	{
		k: ["starter"],
		a: "Starter is 499 dollars a month: 3 active agent nodes, up to 50,000 tasks, the standard visual builder, and webhooks and API access.",
		go: "#pricing",
	},
	{
		k: ["growth"],
		a: "Growth is 899 dollars a month: 8 agent nodes, up to 250,000 tasks, a RAG knowledge base, and CRM and Slack integrations.",
		go: "#pricing",
	},
	{
		k: ["pro ", "pro enterprise", "enterprise"],
		a: "Pro Enterprise is 1,499 dollars a month: 15 agent nodes, unlimited task executions, custom voice and LLM models, a dedicated solution engineer and a 99.9 percent uptime SLA.",
		go: "#pricing",
	},
	{
		k: [
			"custom cluster",
			"on-premise",
			"on premise",
			"vpc",
			"private cloud",
			"hipaa",
			"soc2",
		],
		a: "The Custom cluster is for private deployments: on-premise or VPC, custom model tuning, SOC2 and HIPAA compliance support, and a 24/7 priority phone line. Pricing is on request.",
		go: "#pricing",
	},
	{
		k: [
			"price",
			"pricing",
			"cost",
			"plan",
			"package",
			"qeemat",
			"kitna",
			"paisa",
			"rate",
			"charges",
			"fee",
			"قیمت",
		],
		a: "We have four plans: Starter at 499 dollars a month, Growth at 899, Pro Enterprise at 1,499, and a Custom cluster. Ask me about any plan for details.",
		go: "#pricing",
	},
	{
		k: [
			"secur",
			"safe",
			"privacy",
			"pii",
			"encrypt",
			"audit",
			"private",
			"mehfooz",
			"سیکیورٹی",
		],
		a: "Security: encrypted traffic, PII redaction before data reaches a model, role-based access, a full audit trail, and human approval for risky actions.",
		go: "#security",
	},
	{
		k: ["roi", "saving", "calculator", "save money", "profit"],
		a: "Use the ROI calculator to estimate yearly hours and money saved for your team size and hourly rate. It is an estimate, not a guarantee.",
		go: "#calculator",
	},
	{
		k: [
			"process",
			"how do you work",
			"how it works",
			"steps",
			"kaise",
			"timeline",
		],
		a: "Our process has four steps: Discover your goals, Design the agents and workflows, Build and test, then Launch and monitor.",
		go: "#process",
	},
	{
		k: ["traffic", "visitor", "24/7", "always on"],
		a: "Our traffic agents greet visitors, capture leads, follow up and keep content fresh around the clock. You can see a live demo next to the contact form.",
		go: "#contact",
	},
	{
		k: ["demo", "trial", "try", "sample"],
		a: "You can try the workflow simulator, the RAG demo and this voice agent right on the page. For a custom demo, message us on WhatsApp.",
		go: "#workflows",
	},
	{
		k: ["support", "after launch", "maintenance", "help me"],
		a: "Pro includes a dedicated solution engineer and the Custom plan includes a 24/7 priority line. Contact us to discuss support for your project.",
		go: "#pricing",
	},
	{
		k: ["youtube", "facebook", "instagram", "linkedin", "social", "follow"],
		a: "You can find us on YouTube, Facebook, Instagram and LinkedIn. The links are in the footer.",
		go: "#footer",
	},
	{
		k: ["dark mode", "light mode", "theme"],
		a: "Use the moon or sun button in the top bar to switch between dark and light mode.",
	},
	{
		k: [
			"contact",
			"whatsapp",
			"number",
			"talk to",
			"human",
			"rabta",
			"start",
			"get started",
			"hire",
			"واٹس",
		],
		a: "You can message us on WhatsApp or use the contact form. I'm opening WhatsApp now.",
		wa: true,
		go: "#contact",
	},
	{
		k: ["thank", "shukriya", "shukria", "thanks"],
		a: "You're welcome! Anything else I can help with?",
	},
	{
		k: ["bye", "goodbye", "allah hafiz"],
		a: "Goodbye! Message us any time on WhatsApp.",
	},
];
const STOP = new Set(
	"the a an is are do you we can i to of and or for in on it your my me with what how".split(
		" ",
	),
);
let voiceOn = true,
	recog = null,
	listening = false,
	lastHit = null;
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

function findAnswer(q) {
	const s = " " + q.toLowerCase().replace(/[^\p{L}\p{N}\s\-\/]/gu, " ") + " ";
	if (lastHit && lastHit.more && /\b(more|detail|aur|mazeed|explain)\b/.test(s))
		return { a: lastHit.more };
	let best = null,
		bs = 0;
	for (const e of VOICE_KB) {
		let sc = 0;
		for (const w of e.k)
			if (s.includes(w.length < 4 ? " " + w + " " : w))
				sc += w.length > 5 ? 3 : 2;
		if (sc > bs) {
			bs = sc;
			best = e;
		}
	}
	if (best) return best;
	const words = s.split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
	let fb = null,
		fs = 0;
	for (const [fq, fa] of FAQS) {
		const t = (fq + " " + fa).toLowerCase();
		const sc = words.filter((w) => t.includes(w)).length;
		if (sc > fs) {
			fs = sc;
			fb = { a: fa };
		}
	}
	return fs >= 2 ? fb : null;
}
function vlog(who, t) {
	const l = document.getElementById("voice-log"),
		me = who === "me";
	l.insertAdjacentHTML(
		"beforeend",
		`<p class="${me ? "text-right" : ""}"><span class="inline-block max-w-[85%] rounded-2xl px-3 py-2 ${me ? "bg-laxa-red/25 text-white" : "laxa-glass text-slate-200"}">${t.replace(/</g, "&lt;")}</span></p>`,
	);
	l.scrollTop = l.scrollHeight;
}
function renderVoiceChips() {
	document.getElementById("voice-chips").innerHTML = [
		"What do you do?",
		"Pricing",
		"Templates",
		"Security",
		"How to start?",
	]
		.map(
			(q) =>
				`<button onclick="voiceAsk('${q}')" class="text-[10px] font-mono px-2.5 py-1 rounded-full laxa-glass border border-white/10 hover:border-laxa-red/60 text-slate-300">${q}</button>`,
		)
		.join("");
}
function toggleVoice() {
	const p = document.getElementById("voice-panel");
	p.classList.toggle("hidden");
	const l = document.getElementById("voice-log");
	if (!p.classList.contains("hidden") && !l.children.length)
		vlog(
			"bot",
			"Hi! I'm the LAXA AI voice agent. Tap the mic and ask about our services, pricing, templates or security." +
				(SR ? "" : " Voice input needs Chrome or Edge, so please type."),
		);
}
function toggleSpeaker() {
	voiceOn = !voiceOn;
	if (!voiceOn && window.speechSynthesis) speechSynthesis.cancel();
	document.querySelector("#spk-btn i").className =
		"fa-solid " + (voiceOn ? "fa-volume-high" : "fa-volume-xmark");
}
function speak(t) {
	if (!voiceOn || !window.speechSynthesis) return;
	speechSynthesis.cancel();
	const u = new SpeechSynthesisUtterance(t);
	u.lang = "en-US";
	u.rate = 1;
	speechSynthesis.speak(u);
}
function voiceAsk(q) {
	document.getElementById("voice-text").value = q;
	voiceSend();
}
async function voiceSend() {
	const i = document.getElementById("voice-text"),
		q = i.value.trim();
	if (!q) return;
	i.value = "";
	vlog("me", q);
	let hit = findAnswer(q),
		a = hit ? (typeof hit.a === "function" ? hit.a() : hit.a) : null;
	if (VOICE_AI_ENDPOINT && !(hit && hit.a)) {
		try {
			const ctx = VOICE_KB.map((e) => (typeof e.a === "function" ? e.a() : e.a))
				.concat(FAQS.map((f) => f[0] + " " + f[1]))
				.join("\n");
			const r = await fetch(VOICE_AI_ENDPOINT, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ question: q, context: ctx }),
			});
			a = (await r.json()).answer || a;
		} catch (e) {}
	}
	if (!a)
		a =
			"I may not have that exact detail. I can tell you about our services, pricing, templates, security or how to start, or you can ask our team on WhatsApp.";
	lastHit = hit;
	setTimeout(() => {
		vlog("bot", a);
		speak(a);
		if (hit && hit.go)
			document.querySelector(hit.go)?.scrollIntoView({ behavior: "smooth" });
		if (hit && hit.wa) window.open(waLink(), "_blank", "noopener");
	}, 350);
}
function toggleMic() {
	if (!SR) {
		vlog("bot", "Voice input needs Chrome or Edge. Please type your question.");
		return;
	}
	const b = document.getElementById("mic-btn");
	if (listening) {
		recog.stop();
		return;
	}
	if (window.speechSynthesis) speechSynthesis.cancel();
	recog = new SR();
	recog.lang = document.getElementById("voice-lang").value;
	recog.interimResults = false;
	recog.onstart = () => {
		listening = true;
		b.classList.add("mic-live");
	};
	recog.onend = () => {
		listening = false;
		b.classList.remove("mic-live");
	};
	recog.onerror = () =>
		vlog(
			"bot",
			"I couldn't hear that. Please allow microphone access and try again.",
		);
	recog.onresult = (e) => {
		document.getElementById("voice-text").value = e.results[0][0].transcript;
		voiceSend();
	};
	recog.start();
}

// ===== TRAFFIC AGENTS TICKER =====
const TRAFFIC_LOGS = [
	"Greeter Agent: welcomed a new visitor",
	"Lead Capture: qualified an enquiry",
	"Follow-up Agent: sent a WhatsApp reply",
	"Content Agent: refreshed page content",
	"Greeter Agent: answered a pricing question",
];

// ===== INIT: intro flow, links, scroll effects =====
document.addEventListener("DOMContentLoaded", () => {
	applyTheme(
		document.documentElement.classList.contains("light") ? "light" : "dark",
	);
	document.querySelectorAll("[data-wa]").forEach((a) => {
		a.href = waLink();
		a.target = "_blank";
		a.rel = "noopener";
	});
	document.querySelectorAll("[data-social]").forEach((a) => {
		a.href = SOCIAL[a.dataset.social] || "#";
	});
	renderTemplates();
	renderFaq();
	renderVoiceChips();
	let ti = 0;
	const tk = document.getElementById("traffic-ticker");
	if (tk)
		setInterval(() => {
			tk.textContent =
				"● " + TRAFFIC_LOGS[ti++ % TRAFFIC_LOGS.length] + " (demo)";
		}, 2200);
	const bar = document.getElementById("scroll-bar");
	let sTick = false;
	const paintBar = () => {
		sTick = false;
		const max = document.documentElement.scrollHeight - innerHeight;
		bar.style.transform = "scaleX(" + (max > 0 ? Math.min(scrollY / max, 1) : 0) + ")";
	};
	addEventListener(
		"scroll",
		() => {
			if (!sTick) {
				sTick = true;
				requestAnimationFrame(paintBar);
			}
		},
		{ passive: true },
	);
	const io = new IntersectionObserver(
		(es) =>
			es.forEach((e) => {
				if (e.isIntersecting) {
					e.target.classList.add("in");
					io.unobserve(e.target);
				}
			}),
		{ threshold: 0.02, rootMargin: "0px 0px -6% 0px" },
	);
	// pause infinite CSS animations of sections that are off screen
	const vis = new IntersectionObserver(
		(es) =>
			es.forEach((e) =>
				e.target.classList.toggle("is-offscreen", !e.isIntersecting),
			),
		{ rootMargin: "150px 0px" },
	);
	document.querySelectorAll("section:not(#hero)").forEach((s) => {
		s.classList.add("reveal");
		io.observe(s);
	});
	document.querySelectorAll("section, footer").forEach((s) => vis.observe(s));
	// SVG (SMIL) animations: pause when off screen
	const svgIo = new IntersectionObserver(
		(es) =>
			es.forEach((e) => {
				const sv = e.target;
				if (!sv.pauseAnimations) return;
				e.isIntersecting ? sv.unpauseAnimations() : sv.pauseAnimations();
			}),
		{ rootMargin: "120px 0px" },
	);
	document
		.querySelectorAll("section svg")
		.forEach((sv) => sv.querySelector("animate, animateMotion, animateTransform") && svgIo.observe(sv));
	const intro = document.getElementById("intro");
	if (!intro) return document.body.classList.add("ready");
	const msgs = [
		"Booting agents...",
		"Connecting workflows...",
		"Securing channels...",
		"Ready",
	];
	let m = 0;
	const t = document.getElementById("intro-text");
	requestAnimationFrame(() => {
		document.getElementById("intro-bar").style.width = "100%";
	});
	const iv = setInterval(() => {
		t.textContent = msgs[Math.min(++m, msgs.length - 1)];
	}, 450);
	setTimeout(() => {
		clearInterval(iv);
		intro.style.opacity = "0";
		document.body.classList.add("ready");
		setTimeout(() => intro.remove(), 700);
	}, 1900);
});
