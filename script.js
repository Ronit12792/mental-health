// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const app = document.getElementById('app');
const moodChartCtx = document.getElementById('moodChart');
const detailedMoodChartCtx = document.getElementById('detailedMoodChart');
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const quickResponses = document.getElementById('quick-responses');
const moodHistoryModal = document.getElementById('mood-history-modal');
const moodHistoryBtn = document.getElementById('mood-history-btn');
const closeHistoryBtn = document.getElementById('close-history');
const breathingModal = document.getElementById('breathing-modal');
const breathingCircle = document.getElementById('breathing-circle');
const breathingText = document.getElementById('breathing-text');
const startBreathingBtn = document.getElementById('start-breathing');
const pauseBreathingBtn = document.getElementById('pause-breathing');
const themeToggle = document.getElementById('theme-toggle');
const journalEntry = document.getElementById('journal-entry');
const saveJournalBtn = document.getElementById('save-journal');
const promptBtn = document.getElementById('prompt-btn');
const journalPrompt = document.getElementById('journal-prompt');

// App State
let moodChart;
let detailedMoodChart;
let breathingInterval;
let isBreathing = false;
let currentPattern = '4-4-8'; // Default breathing pattern
let darkMode = false;

// Sample mood data (in a real app, this would come from a database)
let moodData = {
  labels: [],
  values: [],
  notes: []
};

// Journal prompts
const prompts = [
  "What's one small thing you're grateful for today?",
  "What emotions have you felt today?",
  "What's something you did well today?",
  "What challenge did you face today and how did you handle it?",
  "What are you looking forward to tomorrow?"
];

// Initialize the app
function initApp() {
  // Simulate loading
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    app.classList.remove('hidden');
    loadMoodData();
    setupEventListeners();
    renderMoodChart();
  }, 1500);
}

// Load mood data from localStorage
function loadMoodData() {
  const savedData = localStorage.getItem('moodData');
  if (savedData) {
    moodData = JSON.parse(savedData);
  } else {
    // Initialize with sample data
    const dates = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString());
      
      // Random mood values for demo
      const moodValue = Math.floor(Math.random() * 5) + 1;
      moodData.values.push(moodValue);
      
      // Sample notes for some days
      if (i % 5 === 0) {
        const notes = [
          "Had a productive day at work",
          "Felt anxious about upcoming meeting",
          "Enjoyed time with friends",
          "Struggled with sleep",
          "Went for a nice walk"
        ];
        moodData.notes.push(notes[Math.floor(Math.random() * notes.length)]);
      } else {
        moodData.notes.push('');
      }
    }
    moodData.labels = dates;
    saveMoodData();
  }
}

// Save mood data to localStorage
function saveMoodData() {
  localStorage.setItem('moodData', JSON.stringify(moodData));
}

// Setup event listeners
function setupEventListeners() {
  // Mood buttons
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const moodValue = parseInt(this.getAttribute('data-mood'));
      recordMood(moodValue);
    });
  });

  // Chat functionality
  sendBtn.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Quick response buttons
  document.querySelectorAll('.quick-response-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      userInput.value = this.textContent;
      sendMessage();
    });
  });

  // Mood history modal
  moodHistoryBtn.addEventListener('click', openMoodHistory);
  closeHistoryBtn.addEventListener('click', closeMoodHistory);

  // Breathing exercise
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tool = this.querySelector('span').textContent;
      if (tool === 'Breathing') openBreathingModal();
      if (tool === 'Emergency') showEmergencyResources();
    });
  });

  startBreathingBtn.addEventListener('click', startBreathing);
  pauseBreathingBtn.addEventListener('click', pauseBreathing);
  document.getElementById('4-4-8-btn').addEventListener('click', () => setBreathingPattern('4-4-8'));
  document.getElementById('4-7-8-btn').addEventListener('click', () => setBreathingPattern('4-7-8'));

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Journal functionality
  saveJournalBtn.addEventListener('click', saveJournalEntry);
  promptBtn.addEventListener('click', getNewPrompt);
}

// Record mood
function recordMood(value) {
  const today = new Date().toLocaleDateString();
  const todayIndex = moodData.labels.indexOf(today);
  
  if (todayIndex !== -1) {
    // Update today's mood
    moodData.values[todayIndex] = value;
  } else {
    // Add new entry
    moodData.labels.push(today);
    moodData.values.push(value);
    moodData.notes.push('');
    
    // Keep only last 30 days
    if (moodData.labels.length > 30) {
      moodData.labels.shift();
      moodData.values.shift();
      moodData.notes.shift();
    }
  }
  
  saveMoodData();
  renderMoodChart();
  
  // Show feedback based on mood
  const feedback = [
    "I'm sorry you're feeling this way. Would you like to talk about it?",
    "It's okay to have down days. Remember this feeling is temporary.",
    "Not every day can be great, but there's always tomorrow.",
    "Glad you're feeling good! What's contributing to this mood?",
    "Wonderful! Savor these positive feelings."
  ];
  
  addBotMessage(feedback[value - 1]);
}

// Render mood chart
function renderMoodChart() {
  // Show last 7 days
  const labels = moodData.labels.slice(-7);
  const values = moodData.values.slice(-7);
  
  if (moodChart) {
    moodChart.destroy();
  }
  
  moodChart = new Chart(moodChartCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mood Level',
        data: values,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#7c3aed',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const moods = ['Terrible', 'Down', 'Neutral', 'Good', 'Great'];
              return moods[context.raw - 1];
            }
          }
        }
      },
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              const emojis = ['😢', '😞', '😐', '🙂', '😊'];
              return emojis[value - 1];
            }
          }
        }
      }
    }
  });
}

// Chat functions
function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  
  addUserMessage(message);
  userInput.value = '';
  
  // Simulate typing indicator
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator flex space-x-1 mb-2';
  typingIndicator.innerHTML = `
    <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
    <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
    <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
  `;
  chatContainer.appendChild(typingIndicator);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  // Simulate bot response after delay
  setTimeout(() => {
    typingIndicator.remove();
    generateBotResponse(message);
  }, 1500);
}

function addUserMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message user-message flex justify-end';
  messageDiv.innerHTML = `
    <div class="message-bubble">${message}</div>
  `;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addBotMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message bot-message flex justify-start';
  messageDiv.innerHTML = `
    <div class="message-bubble">${message}</div>
  `;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function generateBotResponse(userMessage) {
  // In a real app, this would call an AI API
  const lowerMsg = userMessage.toLowerCase();
  let response;
  
  // Simple keyword matching
  if (lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
    response = "Hello there! How can I support you today?";
  } 
  else if (lowerMsg.includes('anxious') || lowerMsg.includes('anxiety') || lowerMsg.includes('stress')) {
    response = "Anxiety can feel overwhelming. Let's try a quick grounding exercise: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.";
  }
  else if (lowerMsg.includes('sad') || lowerMsg.includes('depress') || lowerMsg.includes('down')) {
    response = "I'm sorry you're feeling this way. Remember that emotions are temporary, like weather passing through. Would you like to try a short mindfulness exercise?";
  }
  else if (lowerMsg.includes('happy') || lowerMsg.includes('good') || lowerMsg.includes('great')) {
    response = "That's wonderful to hear! Savoring positive emotions can help build resilience. What's contributing to your good mood today?";
  }
  else {
    // Default empathetic responses
    const defaultResponses = [
      "I hear you. Would you like to elaborate on that?",
      "That sounds difficult. I'm here to listen if you'd like to share more.",
      "Thank you for sharing that with me. How is that making you feel?",
      "I appreciate you opening up about this. What do you think might help in this situation?"
    ];
    response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }
  
  addBotMessage(response);
  
  // If message contains crisis words, show emergency resources
  const crisisWords = ['suicide', 'kill myself', 'end it all', 'harm myself'];
  if (crisisWords.some(word => lowerMsg.includes(word))) {
    setTimeout(() => {
      showEmergencyResources();
    }, 1000);
  }
}

// Mood history functions
function openMoodHistory() {
  renderDetailedMoodChart();
  renderMoodHistoryTable();
  moodHistoryModal.classList.remove('hidden');
}

function closeMoodHistory() {
  moodHistoryModal.classList.add('hidden');
}

function renderDetailedMoodChart() {
  if (detailedMoodChart) {
    detailedMoodChart.destroy();
  }
  
  detailedMoodChart = new Chart(detailedMoodChartCtx, {
    type: 'line',
    data: {
      labels: moodData.labels,
      datasets: [{
        label: 'Mood Level',
        data: moodData.values,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#7c3aed',
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const moods = ['Terrible', 'Down', 'Neutral', 'Good', 'Great'];
              return moods[context.raw - 1];
            }
          }
        }
      },
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              const emojis = ['😢', '😞', '😐', '🙂', '😊'];
              return emojis[value - 1];
            }
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}

function renderMoodHistoryTable() {
  const tableBody = document.getElementById('mood-history-table');
  tableBody.innerHTML = '';
  
  // Show in reverse chronological order
  for (let i = moodData.labels.length - 1; i >= 0; i--) {
    const row = document.createElement('tr');
    const moodEmojis = ['😢', '😞', '😐', '🙂', '😊'];
    
    row.innerHTML = `
      <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${moodData.labels[i]}</td>
      <td class="px-4 py-2 whitespace-nowrap text-2xl">${moodEmojis[moodData.values[i] - 1]}</td>
      <td class="px-4 py-2 text-sm text-gray-700">${moodData.notes[i] || '-'}</td>
    `;
    
    tableBody.appendChild(row);
  }
}

// Breathing exercise functions
function openBreathingModal() {
  breathingModal.classList.remove('hidden');
}

function closeBreathingModal() {
  breathingModal.classList.add('hidden');
  pauseBreathing();
}

function startBreathing() {
  if (isBreathing) return;
  
  isBreathing = true;
  let cycle = 0;
  const [inhale, hold, exhale] = currentPattern.split('-').map(Number);
  const totalTime = (inhale + hold + exhale) * 1000;
  
  breathingText.textContent = 'Breathe In';
  breathingCircle.classList.add('breathing-circle-active');
  
  breathingInterval = setInterval(() => {
    cycle++;
    const phase = cycle % 3;
    
    if (phase === 0) {
      breathingText.textContent = 'Breathe In';
    } else if (phase === 1) {
      breathingText.textContent = 'Hold';
    } else {
      breathingText.textContent = 'Breathe Out';
    }
  }, totalTime / 3);
}

function pauseBreathing() {
  isBreathing = false;
  clearInterval(breathingInterval);
  breathingCircle.classList.remove('breathing-circle-active');
  breathingText.textContent = 'Paused';
}

function setBreathingPattern(pattern) {
  currentPattern = pattern;
  if (isBreathing) {
    pauseBreathing();
    startBreathing();
  }
}

// Emergency resources
function showEmergencyResources() {
  addBotMessage(`<div class="crisis-alert p-3 rounded-lg">
    <h3 class="font-medium">If you're in crisis, please reach out to:</h3>
    <ul class="list-disc pl-5 mt-1">
      <li>National Suicide Prevention Lifeline: <strong>988</strong></li>
      <li>Crisis Text Line: Text <strong>HOME</strong> to 741741</li>
      <li>Your local emergency services</li>
    </ul>
    <p class="mt-2 text-sm">You're not alone, and help is available.</p>
  </div>`);
}

// Theme toggle
function toggleTheme() {
  darkMode = !darkMode;
  document.documentElement.classList.toggle('dark', darkMode);
  
  const icon = themeToggle.querySelector('i');
  if (darkMode) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
}

// Journal functions
function getNewPrompt() {
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
  journalPrompt.innerHTML = `<p class="text-sm text-gray-700 italic">"${randomPrompt}"</p>`;
}

function saveJournalEntry() {
  const entry = journalEntry.value.trim();
  if (!entry) return;
  
  const today = new Date().toLocaleDateString();
  const todayIndex = moodData.labels.indexOf(today);
  
  if (todayIndex !== -1) {
    moodData.notes[todayIndex] = entry;
    saveMoodData();
    
    // Show confirmation
    const confirmation = document.createElement('div');
    confirmation.className = 'bg-green-50 border-l-4 border-green-500 p-3 rounded-r mb-4 mt-2';
    confirmation.innerHTML = '<p class="text-sm text-green-700">Journal entry saved successfully!</p>';
    journalEntry.parentNode.insertBefore(confirmation, journalEntry.nextSibling);
    
    // Remove after 3 seconds
    setTimeout(() => {
      confirmation.remove();
    }, 3000);
  } else {
    alert("Please record your mood first before saving a journal entry.");
  }
}

// Initialize the app
initApp();