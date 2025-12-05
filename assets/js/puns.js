const puns = [
    {
        setup: "Por que o livro de matemática se suicidou?",
        punchline: "Porque tinha muitos problemas! 📐"
    },
    {
        setup: "O que o zero disse para o oito?",
        punchline: "Que cinto bonito! 0️⃣8️⃣"
    },
    {
        setup: "Qual é o cúmulo da força?",
        punchline: "Dobrar a esquina! 💪"
    },
    {
        setup: "Por que a plantinha não foi atendida no hospital?",
        punchline: "Porque só tinha médico de plantão! 🌿"
    },
    {
        setup: "O que o pagodeiro foi fazer na igreja?",
        punchline: "Foi cantar 'Pá God'! 🎶"
    },
    {
        setup: "Qual é o rei dos queijos?",
        punchline: "O Requeijão! 🧀"
    },
    {
        setup: "O que a lua disse ao sol?",
        punchline: "Nossa, você é tão grande e não te deixam sair à noite! 🌙"
    },
    {
        setup: "Por que o jacaré tirou o filho da escola?",
        punchline: "Porque ele réptil de ano! 🐊"
    },
    {
        setup: "Qual é o doce preferido do átomo?",
        punchline: "Pé de molécula! 🍬"
    },
    {
        setup: "O que o pato disse para a pata?",
        punchline: "Vem Quá! 🦆"
    },
    {
        setup: "Por que o bombeiro não gosta de andar?",
        punchline: "Porque ele socorre! 🚒"
    },
    {
        setup: "Qual é a cidade que não tem táxi?",
        punchline: "Uberlândia! 🚗"
    }
];

let currentPunIndex = -1;
const cardContainer = document.getElementById('pun-card-container');
const nextBtn = document.getElementById('next-pun-btn');

function getRandomPun() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * puns.length);
    } while (newIndex === currentPunIndex && puns.length > 1);
    
    currentPunIndex = newIndex;
    return puns[currentPunIndex];
}

function createCard(pun) {
    const card = document.createElement('div');
    card.className = 'pun-display-card';
    
    card.innerHTML = `
        <div class="pun-inner">
            <div class="pun-front">
                <div class="pun-icon">🤔</div>
                <p class="pun-text">${pun.setup}</p>
                <span class="tap-hint">Toque para ver a resposta</span>
            </div>
            <div class="pun-back">
                <div class="pun-icon">😂</div>
                <p class="pun-text">${pun.punchline}</p>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        card.classList.toggle('flipped');
        if (card.classList.contains('flipped')) {
            triggerConfetti(card);
        }
    });

    return card;
}

function showNextPun() {
    // Disable button temporarily
    nextBtn.disabled = true;
    
    const oldCard = cardContainer.querySelector('.pun-display-card');
    const newPun = getRandomPun();
    const newCard = createCard(newPun);

    // Prepare new card (start off-screen right)
    newCard.classList.add('entering');
    cardContainer.appendChild(newCard);

    // Animate old card out (to left)
    if (oldCard) {
        oldCard.classList.add('exiting');
        setTimeout(() => {
            oldCard.remove();
        }, 500); // Match CSS transition
    }

    // Animate new card in
    requestAnimationFrame(() => {
        newCard.classList.remove('entering');
    });

    setTimeout(() => {
        nextBtn.disabled = false;
    }, 500);
}

function triggerConfetti(element) {
    // Simple emoji burst effect
    const rect = element.getBoundingClientRect();
    const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };

    for (let i = 0; i < 10; i++) {
        createEmojiParticle(center.x, center.y);
    }
}

function createEmojiParticle(x, y) {
    const emojis = ['😂', '🤣', '😹', '💀', '✨'];
    const particle = document.createElement('div');
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.className = 'emoji-particle';
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = 100 + Math.random() * 100;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);

    document.body.appendChild(particle);

    setTimeout(() => {
        particle.remove();
    }, 1000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showNextPun();
    nextBtn.addEventListener('click', showNextPun);
});
