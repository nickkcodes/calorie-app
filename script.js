// ── State ──────────────────────────────────────────────
let totalCalories = 0
let calorieGoal   = 2000
let glasses       = 0
let maxGlasses    = 8
let currentPage   = 0
let mealCalories  = { breakfast: 0, lunch: 0, dinner: 0 }
let totalCarbs    = 0
let totalProtein  = 0
let totalFat      = 0

const todayIndex = (new Date().getDay() + 6) % 7
let weeklyData    = [0, 0, 0, 0, 0, 0, 0]

// ── DOM refs ───────────────────────────────────────────
const slider        = document.querySelector('.slider')
const dot1          = document.getElementById('dot-1')
const dot2          = document.getElementById('dot-2')
const dot3          = document.getElementById('dot-3')
const calorieRing   = document.getElementById('calorie-ring')
const caloriesEaten = document.getElementById('calories-eaten')
const addFoodBtn    = document.getElementById('add-food-btn')
const addWaterBtn   = document.getElementById('add-water')
const removeWaterBtn= document.getElementById('remove-water')
const glassesDrunk  = document.getElementById('glasses-drunk')

// ── Swipe ──────────────────────────────────────────────
let startX = 0

slider.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX
})

slider.addEventListener('touchend', function(e) {
    const endX = e.changedTouches[0].clientX
    const diff = startX - endX
    if (diff > 50 && currentPage < 2) goToPage(currentPage + 1)
    if (diff < -50 && currentPage > 0) goToPage(currentPage - 1)
})

// ── Navigation ─────────────────────────────────────────
dot1.addEventListener('click', function() { goToPage(0) })
dot2.addEventListener('click', function() { goToPage(1) })
dot3.addEventListener('click', function() { goToPage(2) })

function goToPage(pageIndex) {
    currentPage = pageIndex
    const pageWidth = slider.parentElement.offsetWidth
    slider.style.transform = `translateX(-${pageIndex * pageWidth}px)`
    dot1.classList.toggle('active', pageIndex === 0)
    dot2.classList.toggle('active', pageIndex === 1)
    dot3.classList.toggle('active', pageIndex === 2)
}

// ── Calorie ring ───────────────────────────────────────
function updateCalorieRing() {
    const circumference = 502
    const progress = Math.min(totalCalories / calorieGoal, 1)
    const offset = circumference - (circumference * progress)
    calorieRing.style.strokeDashoffset = offset
    caloriesEaten.textContent = totalCalories
}

// ── Weekly chart ───────────────────────────────────────
function updateWeeklyChart() {
    weeklyData.forEach(function(calories, index) {
        const bar = document.getElementById('bar-' + index)
        const percent = Math.min((calories / calorieGoal) * 90, 90)
        bar.style.height = percent + '%'
        if (index === todayIndex) bar.classList.add('today')
    })
}

// ── Macros ─────────────────────────────────────────────
function updateMacros() {
    const goals = { carbs: 163, fat: 43, protein: 65 }

    function updateRing(value, goal, id) {
        const circle = document.getElementById(id)
        if (!circle) return
        const percent = Math.min(value / goal, 1)
        circle.style.strokeDashoffset = 314 - (314 * percent)
    }

    updateRing(totalCarbs, goals.carbs, 'ring-carbs')
    updateRing(totalFat, goals.fat, 'ring-fat')
    updateRing(totalProtein, goals.protein, 'ring-protein')

    const carbsBar   = document.getElementById('bar-carbs')
    const proteinBar = document.getElementById('bar-protein')
    const fatBar     = document.getElementById('fat-bar')

    if (carbsBar)   carbsBar.style.width   = Math.min((totalCarbs / 163) * 100, 100) + '%'
    if (proteinBar) proteinBar.style.width = Math.min((totalProtein / 65) * 100, 100) + '%'
    if (fatBar)     fatBar.style.width     = Math.min((totalFat / 43) * 100, 100) + '%'

    const els = {
        'carbs-left':    Math.max(0, goals.carbs - totalCarbs) + 'g left',
        'fat-left':      Math.max(0, goals.fat - totalFat) + 'g left',
        'protein-left':  Math.max(0, goals.protein - totalProtein) + 'g left',
        'remain-calories': Math.max(0, calorieGoal - totalCalories),
        'carbs-g':       totalCarbs,
        'fat-g':         totalFat,
        'protein-g':     totalProtein
    }

    Object.entries(els).forEach(function([id, val]) {
        const el = document.getElementById(id)
        if (el) el.textContent = val
    })
}

// ── Food log ───────────────────────────────────────────
function addFoodToLog(foodName, calories, carbs, protein, fat) {
    const meal = getCurrentMeal()

    totalCalories += calories
    totalCarbs    += carbs
    totalProtein  += protein
    totalFat      += fat
    mealCalories[meal] += calories
    weeklyData[todayIndex] += calories

    updateCalorieRing()
    updateWeeklyChart()
    updateMacros()

    document.getElementById('kcal-' + meal).textContent        = mealCalories[meal] + ' kcal'
    document.getElementById('detail-kcal-' + meal).textContent = mealCalories[meal]

    const item = document.createElement('li')
    item.textContent = foodName + ' — ' + calories + ' kcal'
    document.getElementById('list-' + meal).appendChild(item)

    const detailItem = document.createElement('li')
    detailItem.textContent = foodName + ' — ' + calories + ' kcal'
    document.getElementById('detail-' + meal).appendChild(detailItem)

    const list  = document.getElementById('list-' + meal)
    const arrow = document.getElementById('arrow-' + meal)
    if (!list.classList.contains('open')) {
        list.classList.add('open')
        arrow.classList.add('open')
    }
}

function getCurrentMeal() {
    const hour = new Date().getHours()
    if (hour < 11) return 'breakfast'
    if (hour < 16) return 'lunch'
    return 'dinner'
}

function toggleMeal(meal) {
    const list  = document.getElementById('list-' + meal)
    const arrow = document.getElementById('arrow-' + meal)
    list.classList.toggle('open')
    arrow.classList.toggle('open')
}

addFoodBtn.addEventListener('click', function() { openScanner() })

// ── Water ──────────────────────────────────────────────
function updateWater() {
    glassesDrunk.textContent = glasses
    const percent = (glasses / maxGlasses) * 100

    const water = document.getElementById('panda-water')
    water.style.height = percent + '%'

    const wave = document.getElementById('panda-wave')
    wave.style.bottom = 'calc(' + percent + '% - 15px)'

    spawnHearts(glasses === maxGlasses)
}

function spawnHearts(isFull) {
    const container = document.getElementById('hearts-container')
    const count = isFull ? 8 : 1
    for (let i = 0; i < count; i++) {
        setTimeout(function() {
            const heart = document.createElement('span')
            heart.textContent = '❤️'
            heart.classList.add('heart')
            if (isFull) heart.classList.add('heart-burst')
            heart.style.left = (20 + Math.random() * 60) + '%'
            heart.style.animationDelay = (Math.random() * 0.3) + 's'
            container.appendChild(heart)
            setTimeout(function() { heart.remove() }, 1500)
        }, i * 100)
    }
    if (isFull) triggerPandaHappy()
}

function triggerPandaHappy() {
    const panda = document.getElementById('panda-mask-wrap')
    panda.classList.remove('happy')
    void panda.offsetWidth
    panda.classList.add('happy')

    const container  = document.getElementById('hearts-container')
    const starEmojis = ['⭐', '✨', '🌟', '💫']
    for (let i = 0; i < 8; i++) {
        setTimeout(function() {
            const star = document.createElement('span')
            star.textContent = starEmojis[Math.floor(Math.random() * starEmojis.length)]
            star.classList.add('star')
            const angle    = Math.random() * 360
            const distance = 60 + Math.random() * 40
            star.style.setProperty('--tx', Math.cos(angle) * distance + 'px')
            star.style.setProperty('--ty', Math.sin(angle) * distance + 'px')
            star.style.left = '50%'
            star.style.top  = '30%'
            container.appendChild(star)
            setTimeout(function() { star.remove() }, 1200)
        }, i * 80)
    }
}

addWaterBtn.addEventListener('click', function() {
    if (glasses < maxGlasses) { glasses++; updateWater() }
})

removeWaterBtn.addEventListener('click', function() {
    if (glasses > 0) { glasses--; updateWater() }
})

// ── Init ───────────────────────────────────────────────
updateWeeklyChart()
updateMacros()

// ── Scanner ────────────────────────────────────────────
const GEMINI_API_KEY = 'ENTER_YOUR_GEMINI_API_KEY'

const fabBtn         = document.getElementById('fab-btn')
const scannerOverlay = document.getElementById('scanner-overlay')
const scannerSheet   = document.getElementById('scanner-sheet')
const closeBtn       = document.getElementById('close-btn')
const analyzeBtn     = document.getElementById('analyze-btn')
const logBtn         = document.getElementById('log-btn')
const cameraBtn      = document.getElementById('camera-btn')
const cameraInput    = document.getElementById('camera-input')
const foodInput      = document.getElementById('food-input')
const resultWrap     = document.getElementById('result-wrap')

let analyzedFood    = null
let foodImageBase64 = null

function openScanner() {
    scannerOverlay.classList.add('open')
    setTimeout(function() { scannerSheet.classList.add('open') }, 10)
    fabBtn.classList.add('open')
}

function closeScanner() {
    scannerSheet.classList.remove('open')
    setTimeout(function() { scannerOverlay.classList.remove('open') }, 400)
    fabBtn.classList.remove('open')
    foodInput.value        = ''
    resultWrap.style.display = 'none'
    analyzedFood    = null
    foodImageBase64 = null
    document.getElementById('food-preview').style.display    = 'none'
    document.getElementById('camera-placeholder').style.display = 'flex'
}

fabBtn.addEventListener('click', openScanner)
closeBtn.addEventListener('click', closeScanner)
scannerOverlay.addEventListener('click', function(e) {
    if (e.target === scannerOverlay) closeScanner()
})

cameraBtn.addEventListener('click', function() { cameraInput.click() })

cameraInput.addEventListener('change', function(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = function(event) {
        const base64 = event.target.result
        foodImageBase64 = base64.split(',')[1]
        const preview = document.getElementById('food-preview')
        preview.src = base64
        preview.style.display = 'block'
        document.getElementById('camera-placeholder').style.display = 'none'
    }
    reader.readAsDataURL(file)
})

analyzeBtn.addEventListener('click', async function() {
    const text = foodInput.value.trim()
    if (!text && !foodImageBase64) {
        alert('Please take a photo or type what you ate!')
        return
    }

    analyzeBtn.textContent = '⏳ Analyzing...'
    analyzeBtn.disabled    = true

    try {
        let contents = []
        if (foodImageBase64) {
            contents = [{
                parts: [
                    { inline_data: { mime_type: 'image/jpeg', data: foodImageBase64 } },
                    { text: 'Analyze this food image. Return ONLY a valid JSON object with keys: name, calories, carbs, protein, fat. All numbers are integers. No other text, just the JSON.' }
                ]
            }]
        } else {
            contents = [{
                parts: [{
                    text: `Analyze this food: "${text}". Return ONLY a valid JSON object with keys: name, calories, carbs, protein, fat. All numbers are integers. Example: {"name":"Chicken Rice","calories":450,"carbs":60,"protein":25,"fat":10}. No other text.`
                }]
            }]
        }

        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        })

        const data = await response.json()
        console.log("FULL RESPONSE:", data)

        if (!response.ok) {
            throw new Error(data?.error?.message || "API request failed")
        }

        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!raw) throw new Error("No response from AI")
        
        const clean = raw.replace(/```json|```/g, '').trim()

        const jsonMatch = clean.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error("No JSON found")
        
        analyzedFood = JSON.parse(jsonMatch[0])

        document.getElementById('result-name').textContent    = '🍽️ ' + analyzedFood.name
        document.getElementById('result-cal').textContent     = '🔥 ' + analyzedFood.calories + ' kcal'
        document.getElementById('result-carbs').textContent   = '🟡 ' + analyzedFood.carbs + 'g carbs'
        document.getElementById('result-protein').textContent = '🔴 ' + analyzedFood.protein + 'g protein'
        document.getElementById('result-fat').textContent     = '🔵 ' + analyzedFood.fat + 'g fat'
        resultWrap.style.display = 'flex'

    } catch (err) {
        alert('Error: ' + err.message)
        console.error(err)
    }

    analyzeBtn.textContent = '✨ Analyze Food'
    analyzeBtn.disabled    = false
})

logBtn.addEventListener('click', function() {
    if (!analyzedFood) return
    addFoodToLog(
        analyzedFood.name,
        analyzedFood.calories,
        analyzedFood.carbs,
        analyzedFood.protein,
        analyzedFood.fat
    )
    closeScanner()
})
