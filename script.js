// ── Intro screen ───────────────────────────
(function showIntro() {
    const intro = document.getElementById('intro-screen')
    if (!intro) return
    setTimeout(function() {
        intro.classList.add('hide')
        setTimeout(function() { 
            intro.classList.add('gone')
            // Show settings button after intro
            const settingsBtn = document.getElementById('settings-btn')
            if (settingsBtn) settingsBtn.style.display = 'flex'
        }, 600)
    }, 2500)
})()

// ── State ──────────────────────────────────
let totalCalories = 0
let calorieGoal   = 2000
let glasses       = 0
let maxGlasses    = 8
let currentPage   = 0
let mealCalories  = { breakfast: 0, lunch: 0, dinner: 0 }
let totalCarbs    = 0
let totalProtein  = 0
let totalFat      = 0
let celebrationShown = false
let selectedGender   = ''

const todayIndex = (new Date().getDay() + 6) % 7
let weeklyData   = [0, 0, 0, 0, 0, 0, 0]

// ── DOM refs ───────────────────────────────
const slider         = document.querySelector('.slider')
const dot1           = document.getElementById('dot-1')
const dot2           = document.getElementById('dot-2')
const dot3           = document.getElementById('dot-3')
const calorieRing    = document.getElementById('calorie-ring')
const caloriesEaten  = document.getElementById('calories-eaten')
const addFoodBtn     = document.getElementById('add-food-btn')
const addWaterBtn    = document.getElementById('add-water')
const removeWaterBtn = document.getElementById('remove-water')
const glassesDrunk   = document.getElementById('glasses-drunk')

// ── Haptic ─────────────────────────────────
function haptic(type) {
    if (!navigator.vibrate) return
    if (type === 'light')   navigator.vibrate(10)
    if (type === 'medium')  navigator.vibrate(30)
    if (type === 'heavy')   navigator.vibrate([50, 30, 50])
    if (type === 'success') navigator.vibrate([10, 50, 10, 50, 80])
}

// ── Swipe ──────────────────────────────────
let startX = 0
slider.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX })
slider.addEventListener('touchend', function(e) {
    const diff = startX - e.changedTouches[0].clientX
    if (diff > 50 && currentPage < 2) goToPage(currentPage + 1)
    if (diff < -50 && currentPage > 0) goToPage(currentPage - 1)
})

// ── Navigation ─────────────────────────────
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

// ── Calorie ring ───────────────────────────
function updateCalorieRing() {
    const circumference = 502
    const progress = Math.min(totalCalories / calorieGoal, 1)
    calorieRing.style.strokeDashoffset = circumference - (circumference * progress)
    caloriesEaten.textContent = totalCalories
}

// ── Weekly chart ───────────────────────────
function updateWeeklyChart() {
    weeklyData.forEach(function(calories, index) {
        const bar = document.getElementById('bar-' + index)
        if (!bar) return
        bar.style.height = Math.min((calories / calorieGoal) * 90, 90) + '%'
        if (index === todayIndex) bar.classList.add('today')
    })
}

// ── Macros ─────────────────────────────────
function updateMacros() {
    const goals = { carbs: 163, fat: 43, protein: 65 }

    function updateRing(value, goal, id) {
        const circle = document.getElementById(id)
        if (!circle) return
        circle.style.strokeDashoffset = 314 - (314 * Math.min(value / goal, 1))
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
        'carbs-left':      Math.max(0, goals.carbs - totalCarbs) + 'g left',
        'fat-left':        Math.max(0, goals.fat - totalFat) + 'g left',
        'protein-left':    Math.max(0, goals.protein - totalProtein) + 'g left',
        'remain-calories': Math.max(0, calorieGoal - totalCalories),
        'carbs-g':         totalCarbs,
        'fat-g':           totalFat,
        'protein-g':       totalProtein
    }
    Object.entries(els).forEach(function([id, val]) {
        const el = document.getElementById(id)
        if (el) el.textContent = val
    })
}

// ── Daily summary ──────────────────────────
function updateDailySummary() {
    const calLeft = Math.max(0, calorieGoal - totalCalories)
    const calLeftEl = document.getElementById('calories-left-summary')
    if (calLeftEl) calLeftEl.textContent = calLeft + ' kcal'

    const statusEl = document.getElementById('day-status')
    if (statusEl) {
        if (totalCalories === 0)      statusEl.textContent = 'Not started yet'
        else if (calLeft > 200)       statusEl.textContent = 'On Track ✅'
        else if (calLeft >= 0)        statusEl.textContent = 'Almost there! 🔥'
        else                          statusEl.textContent = 'Over goal ⚠️'
    }

    const waterStatusEl = document.getElementById('water-status')
    if (waterStatusEl) waterStatusEl.textContent = glasses + ' / 8'

    const proteinStatusEl = document.getElementById('protein-status')
    const carbsStatusEl   = document.getElementById('carbs-status')
    const fatStatusEl     = document.getElementById('fat-status')
    if (proteinStatusEl) proteinStatusEl.textContent = totalProtein + 'g / 65g'
    if (carbsStatusEl)   carbsStatusEl.textContent   = totalCarbs + 'g / 163g'
    if (fatStatusEl)     fatStatusEl.textContent     = totalFat + 'g / 43g'
}

// ── Streak ─────────────────────────────────
function updateStreak() {
    const today    = new Date().toDateString()
    const lastGoal = localStorage.getItem('streak_last_goal')
    let streak     = parseInt(localStorage.getItem('streak_count')) || 0

    if (totalCalories >= calorieGoal * 0.9) {
        if (lastGoal !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            streak = lastGoal === yesterday.toDateString() ? streak + 1 : 1
            localStorage.setItem('streak_last_goal', today)
            localStorage.setItem('streak_count', streak)
        }
    }

    const el  = document.getElementById('streak-number')
    const sub = document.querySelector('.streak-sub')
    if (!el) return

    if (streak === 0) {
        el.textContent  = 'No streak yet'
        if (sub) sub.textContent = 'Hit your goal to start one!'
    } else if (streak === 1) {
        el.textContent  = '1 day streak! 🌱'
        if (sub) sub.textContent = 'Keep it up tomorrow!'
    } else {
        el.textContent  = streak + ' day streak! 🔥'
        if (sub) sub.textContent = streak >= 7 ? 'Nickyy is proud of you! 🐼' : 'Keep it going!'
    }
}

// ── Goal celebration ───────────────────────
function checkGoalCelebration() {
    if (celebrationShown) return
    if (totalCalories >= calorieGoal * 0.9 && totalCalories <= calorieGoal * 1.1) {
        celebrationShown = true
        haptic('success')
        const msgs = [
            "Nickyy is doing a happy dance for you! 🐼",
            "You crushed it today! Nickyy approves! 🎋",
            "Goal achieved! Nickyy wants a high five! 🐾",
            "You're on fire! Nickyy is impressed! 🔥"
        ]
        const msgEl = document.getElementById('celebration-msg')
        if (msgEl) msgEl.textContent = msgs[Math.floor(Math.random() * msgs.length)]
        const overlay = document.getElementById('celebration-overlay')
        if (overlay) overlay.classList.add('show')
        updateStreak()
    }
}

function closeCelebration() {
    const overlay = document.getElementById('celebration-overlay')
    if (overlay) overlay.classList.remove('show')
}

// ── Food log ───────────────────────────────
function addFoodToLog(foodName, calories, carbs, protein, fat) {
    const meal = getCurrentMeal()

    totalCalories      += calories
    totalCarbs         += carbs
    totalProtein       += protein
    totalFat           += fat
    mealCalories[meal] += calories
    weeklyData[todayIndex] += calories

    updateCalorieRing()
    updateWeeklyChart()
    updateMacros()
    updateDailySummary()
    updateStreak()
    checkGoalCelebration()
    haptic('success')

    // update page 1 meal header
    const kcalEl = document.getElementById('kcal-' + meal)
    if (kcalEl) kcalEl.textContent = mealCalories[meal] + ' kcal'

    // add to page 1 log
    const item = document.createElement('li')
    item.textContent = foodName + ' — ' + calories + ' kcal'
    document.getElementById('list-' + meal).appendChild(item)

    // auto open page 1 meal
    const list  = document.getElementById('list-' + meal)
    const arrow = document.getElementById('arrow-' + meal)
    if (list && !list.classList.contains('open')) {
        list.classList.add('open')
        if (arrow) arrow.classList.add('open')
    }

    // add to page 3 detail with macro chips + delete button
    const detailList = document.getElementById('detail-' + meal)
    const emptyMsg   = document.getElementById('empty-' + meal)
    if (emptyMsg) emptyMsg.style.display = 'none'

    const li = document.createElement('li')
    li.classList.add('food-item')
    li.innerHTML = `
        <div class="food-item-top">
            <span class="food-item-name">${foodName}</span>
            <div class="food-item-right">
                <span class="food-item-cal">${calories} kcal</span>
                <button class="food-item-delete" onclick="deleteFoodItem(this, '${meal}', ${calories}, ${carbs}, ${protein}, ${fat})">🗑️</button>
            </div>
        </div>
        <div class="food-item-macros">
            <span class="macro-chip chip-carbs">C ${carbs}g</span>
            <span class="macro-chip chip-protein">P ${protein}g</span>
            <span class="macro-chip chip-fat">F ${fat}g</span>
        </div>
    `
    if (detailList) detailList.appendChild(li)

    // update page 3 card kcal
    const cardKcal = document.getElementById('card-kcal-' + meal)
    if (cardKcal) cardKcal.textContent = mealCalories[meal] + ' kcal'

    // auto open page 3 card
    const cardBody  = document.getElementById('card-body-' + meal)
    const cardArrow = document.getElementById('card-arrow-' + meal)
    if (cardBody && !cardBody.classList.contains('open')) {
        cardBody.classList.add('open')
        if (cardArrow) cardArrow.classList.add('open')
    }

    saveData()
}

function deleteFoodItem(btn, meal, calories, carbs, protein, fat) {
    totalCalories          -= calories
    totalCarbs             -= carbs
    totalProtein           -= protein
    totalFat               -= fat
    mealCalories[meal]     -= calories
    weeklyData[todayIndex] -= calories

    updateCalorieRing()
    updateWeeklyChart()
    updateMacros()
    updateDailySummary()

    const cardKcal = document.getElementById('card-kcal-' + meal)
    if (cardKcal) cardKcal.textContent = mealCalories[meal] + ' kcal'
    const kcalEl = document.getElementById('kcal-' + meal)
    if (kcalEl) kcalEl.textContent = mealCalories[meal] + ' kcal'

    btn.closest('.food-item').remove()

    const list = document.getElementById('detail-' + meal)
    if (list && list.children.length === 0) {
        const empty = document.getElementById('empty-' + meal)
        if (empty) empty.style.display = 'block'
    }

    saveData()
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
    if (list) list.classList.toggle('open')
    if (arrow) arrow.classList.toggle('open')
}

function toggleMealCard(meal) {
    const body  = document.getElementById('card-body-' + meal)
    const arrow = document.getElementById('card-arrow-' + meal)
    if (body) body.classList.toggle('open')
    if (arrow) arrow.classList.toggle('open')
}

addFoodBtn.addEventListener('click', function() { openScanner() })

// ── Water ──────────────────────────────────
function updateWater() {
    if (glassesDrunk) glassesDrunk.textContent = glasses
    const percent = (glasses / maxGlasses) * 100

    const water = document.getElementById('panda-water')
    const wave  = document.getElementById('panda-wave')
    if (water) water.style.height = percent + '%'
    if (wave)  wave.style.bottom  = 'calc(' + percent + '% - 15px)'

    spawnHearts(glasses === maxGlasses)
    updateDailySummary()
    haptic('light')
    saveData()
}

function spawnHearts(isFull) {
    const container = document.getElementById('hearts-container')
    if (!container) return
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
    if (isFull) { triggerPandaHappy(); haptic('heavy') }
}

function triggerPandaHappy() {
    const panda = document.getElementById('panda-mask-wrap')
    if (!panda) return
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
            if (container) container.appendChild(star)
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

// ── Storage ────────────────────────────────
function saveData() {
    const today = new Date().toDateString()
    localStorage.setItem('ct_date',        today)
    localStorage.setItem('ct_calories',    totalCalories)
    localStorage.setItem('ct_carbs',       totalCarbs)
    localStorage.setItem('ct_protein',     totalProtein)
    localStorage.setItem('ct_fat',         totalFat)
    localStorage.setItem('ct_glasses',     glasses)
    localStorage.setItem('ct_weekly',      JSON.stringify(weeklyData))
    localStorage.setItem('ct_meal_cals',   JSON.stringify(mealCalories))
    localStorage.setItem('ct_log_breakfast', document.getElementById('list-breakfast').innerHTML)
    localStorage.setItem('ct_log_lunch',     document.getElementById('list-lunch').innerHTML)
    localStorage.setItem('ct_log_dinner',    document.getElementById('list-dinner').innerHTML)
    localStorage.setItem('ct_detail_breakfast', document.getElementById('detail-breakfast').innerHTML)
    localStorage.setItem('ct_detail_lunch',     document.getElementById('detail-lunch').innerHTML)
    localStorage.setItem('ct_detail_dinner',    document.getElementById('detail-dinner').innerHTML)
}

function loadData() {
    const savedDate = localStorage.getItem('ct_date')
    const today     = new Date().toDateString()

    if (savedDate && savedDate !== today) {
        // save important data before clearing
        const savedWeekly = localStorage.getItem('ct_weekly')
        const obDone   = localStorage.getItem('ob_done')
        const obWeight = localStorage.getItem('ob_weight')
        const obGoal   = localStorage.getItem('ob_goal_weight')
        const obHeight = localStorage.getItem('ob_height')
        const obAge    = localStorage.getItem('ob_age')
        const obGender = localStorage.getItem('ob_gender')
        const streak   = localStorage.getItem('streak_count')
        const lastGoal = localStorage.getItem('streak_last_goal')

        localStorage.clear()

        if (obDone) {
            localStorage.setItem('ob_done',        obDone)
            localStorage.setItem('ob_weight',      obWeight)
            localStorage.setItem('ob_goal_weight', obGoal)
            localStorage.setItem('ob_height',      obHeight)
            localStorage.setItem('ob_age',         obAge)
            localStorage.setItem('ob_gender',      obGender)
        }
        if (savedWeekly) localStorage.setItem('ct_weekly', savedWeekly)
        if (streak)      localStorage.setItem('streak_count', streak)
        if (lastGoal)    localStorage.setItem('streak_last_goal', lastGoal)
        return
    }

    if (savedDate === today) {
        totalCalories = parseInt(localStorage.getItem('ct_calories'))  || 0
        totalCarbs    = parseInt(localStorage.getItem('ct_carbs'))     || 0
        totalProtein  = parseInt(localStorage.getItem('ct_protein'))   || 0
        totalFat      = parseInt(localStorage.getItem('ct_fat'))       || 0
        glasses       = parseInt(localStorage.getItem('ct_glasses'))   || 0
        weeklyData    = JSON.parse(localStorage.getItem('ct_weekly'))  || [0,0,0,0,0,0,0]

        const savedMealCals = localStorage.getItem('ct_meal_cals')
        if (savedMealCals) mealCalories = JSON.parse(savedMealCals)

        // restore page 1 meal headers
        document.getElementById('kcal-breakfast').textContent = mealCalories.breakfast + ' kcal'
        document.getElementById('kcal-lunch').textContent     = mealCalories.lunch + ' kcal'
        document.getElementById('kcal-dinner').textContent    = mealCalories.dinner + ' kcal'

        // restore page 1 food lists
        const lb = localStorage.getItem('ct_log_breakfast')
        const ll = localStorage.getItem('ct_log_lunch')
        const ld = localStorage.getItem('ct_log_dinner')
        if (lb) document.getElementById('list-breakfast').innerHTML = lb
        if (ll) document.getElementById('list-lunch').innerHTML     = ll
        if (ld) document.getElementById('list-dinner').innerHTML    = ld

        // restore page 3 detail lists
        const db = localStorage.getItem('ct_detail_breakfast')
        const dl = localStorage.getItem('ct_detail_lunch')
        const dd = localStorage.getItem('ct_detail_dinner')
        if (db) { document.getElementById('detail-breakfast').innerHTML = db; document.getElementById('empty-breakfast').style.display = db.trim() ? 'none' : 'block' }
        if (dl) { document.getElementById('detail-lunch').innerHTML     = dl; document.getElementById('empty-lunch').style.display     = dl.trim() ? 'none' : 'block' }
        if (dd) { document.getElementById('detail-dinner').innerHTML    = dd; document.getElementById('empty-dinner').style.display     = dd.trim() ? 'none' : 'block' }

        // restore page 3 card kcal
        document.getElementById('card-kcal-breakfast').textContent = mealCalories.breakfast + ' kcal'
        document.getElementById('card-kcal-lunch').textContent     = mealCalories.lunch + ' kcal'
        document.getElementById('card-kcal-dinner').textContent    = mealCalories.dinner + ' kcal'

        // restore water
        if (glassesDrunk) glassesDrunk.textContent = glasses
        const percent = (glasses / maxGlasses) * 100
        const water = document.getElementById('panda-water')
        const wave  = document.getElementById('panda-wave')
        if (water) water.style.height = percent + '%'
        if (wave)  wave.style.bottom  = 'calc(' + percent + '% - 15px)'
    }
}

// ── Onboarding ─────────────────────────────
function selectGender(gender) {
    selectedGender = gender
    document.getElementById('btn-male').classList.toggle('selected', gender === 'male')
    document.getElementById('btn-female').classList.toggle('selected', gender === 'female')
}

function saveOnboarding() {
    const weight     = document.getElementById('ob-weight').value
    const goalWeight = document.getElementById('ob-goal-weight').value
    const height     = document.getElementById('ob-height').value
    const age        = document.getElementById('ob-age').value

    if (!weight || !goalWeight || !height || !age || !selectedGender) {
        alert('Please fill in all fields! 😊')
        return
    }

    localStorage.setItem('ob_weight',      weight)
    localStorage.setItem('ob_goal_weight', goalWeight)
    localStorage.setItem('ob_height',      height)
    localStorage.setItem('ob_age',         age)
    localStorage.setItem('ob_gender',      selectedGender)
    localStorage.setItem('ob_done',        'true')

    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseFloat(age)
    let bmr = selectedGender === 'male'
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161
    const tdee = Math.round(bmr * 1.55)
    calorieGoal = parseFloat(goalWeight) < w ? tdee - 500 : tdee

    document.getElementById('calorie-goal').textContent = calorieGoal
    updateCalorieRing()
    updateDailySummary()

    const overlay = document.getElementById('onboard-overlay')
    overlay.style.opacity    = '0'
    overlay.style.transition = 'opacity 0.3s ease'
    setTimeout(function() {
        overlay.classList.add('hidden')
        overlay.style.opacity = ''
    }, 300)
}

function checkOnboarding() {
    if (localStorage.getItem('ob_done') === 'true') {
        const overlay = document.getElementById('onboard-overlay')
        if (overlay) overlay.classList.add('hidden')

        const w = parseFloat(localStorage.getItem('ob_weight'))
        const h = parseFloat(localStorage.getItem('ob_height'))
        const a = parseFloat(localStorage.getItem('ob_age'))
        const g = localStorage.getItem('ob_gender')
        const gw = parseFloat(localStorage.getItem('ob_goal_weight'))

        if (w && h && a && g) {
            let bmr = g === 'male'
                ? 10 * w + 6.25 * h - 5 * a + 5
                : 10 * w + 6.25 * h - 5 * a - 161
            const tdee = Math.round(bmr * 1.55)
            calorieGoal = gw < w ? tdee - 500 : tdee
            document.getElementById('calorie-goal').textContent = calorieGoal
        }
    }
}

// ── Settings ───────────────────────────────
let settingsGender = ''

function openSettings() {
    document.getElementById('set-weight').value      = localStorage.getItem('ob_weight') || ''
    document.getElementById('set-goal-weight').value = localStorage.getItem('ob_goal_weight') || ''
    document.getElementById('set-height').value      = localStorage.getItem('ob_height') || ''
    document.getElementById('set-age').value         = localStorage.getItem('ob_age') || ''

    settingsGender = localStorage.getItem('ob_gender') || ''
    document.getElementById('set-btn-male').classList.toggle('selected', settingsGender === 'male')
    document.getElementById('set-btn-female').classList.toggle('selected', settingsGender === 'female')

    const overlay = document.getElementById('settings-overlay')
    const sheet   = document.getElementById('settings-sheet')
    overlay.classList.add('open')
    setTimeout(function() { sheet.classList.add('open') }, 10)
}

function closeSettings() {
    const overlay = document.getElementById('settings-overlay')
    const sheet   = document.getElementById('settings-sheet')
    sheet.classList.remove('open')
    setTimeout(function() { overlay.classList.remove('open') }, 400)
}

function setGender(gender) {
    settingsGender = gender
    document.getElementById('set-btn-male').classList.toggle('selected', gender === 'male')
    document.getElementById('set-btn-female').classList.toggle('selected', gender === 'female')
}

function saveSettings() {
    const weight     = document.getElementById('set-weight').value
    const goalWeight = document.getElementById('set-goal-weight').value
    const height     = document.getElementById('set-height').value
    const age        = document.getElementById('set-age').value

    if (!weight || !goalWeight || !height || !age || !settingsGender) {
        alert('Please fill in all fields!')
        return
    }

    localStorage.setItem('ob_weight',      weight)
    localStorage.setItem('ob_goal_weight', goalWeight)
    localStorage.setItem('ob_height',      height)
    localStorage.setItem('ob_age',         age)
    localStorage.setItem('ob_gender',      settingsGender)

    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseFloat(age)
    let bmr = settingsGender === 'male'
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161
    const tdee = Math.round(bmr * 1.55)
    calorieGoal = parseFloat(goalWeight) < w ? tdee - 500 : tdee

    document.getElementById('calorie-goal').textContent = calorieGoal
    updateCalorieRing()
    updateDailySummary()
    closeSettings()
    alert('Settings saved! 🐼')
}

function resetAllData() {
    if (confirm('Are you sure? This will delete ALL your data including streak and history!')) {
        localStorage.clear()
        location.reload()
    }
}

// ── Scanner ────────────────────────────────
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
    foodInput.value          = ''
    resultWrap.style.display = 'none'
    analyzedFood    = null
    foodImageBase64 = null
    document.getElementById('food-preview').style.display       = 'none'
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

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data?.error?.message || 'API request failed')

        const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!raw) throw new Error('No response from AI')

        const clean     = raw.replace(/```json|```/g, '').trim()
        const jsonMatch = clean.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found')

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
    addFoodToLog(analyzedFood.name, analyzedFood.calories, analyzedFood.carbs, analyzedFood.protein, analyzedFood.fat)
    closeScanner()
})

// ── Init ───────────────────────────────────
loadData()
checkOnboarding()
updateWeeklyChart()
updateCalorieRing()
updateMacros()
updateDailySummary()
updateStreak()

// ── PWA Service Worker ─────────────────────
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js')
            .then(function() { console.log('SW registered') })
            .catch(function(err) { console.log('SW failed:', err) })
    })
}