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

const slider = document.querySelector('.slider')
const dot1 = document.getElementById('dot-1')
const dot2 = document.getElementById('dot-2')
const dot3 = document.getElementById('dot-3')
const calorieRing = document.getElementById('calorie-ring')
const caloriesEaten = document.getElementById('calories-eaten')
const addFoodBtn =document.getElementById('add-food-btn')
const addWaterBtn = document.getElementById('add-water')
const removeWaterBtn = document.getElementById('remove-water')
const glassesDrunk = document.getElementById('glasses-drunk')

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

function updateCalorieRing() {
    const circumference = 502
    const progress = Math.min(totalCalories / calorieGoal, 1)
    const offset = circumference - (circumference * progress)
    calorieRing.style.strokeDashoffset = offset
    caloriesEaten.textContent = totalCalories
}

function updateWeeklyChart() {
    weeklyData.forEach(function(calories, index) {
        const bar = document.getElementById('bar-' + index)

        const percent = Math.min((calories / calorieGoal) * 90, 90)
        bar.style.height = percent + '%'

        if (index === todayIndex) {
            bar.classList.add('today')
        }
    })
}

function updateMacros() {
    const goals = {
        carbs: 163,
        fat: 43,    
        protein: 65
    }

    function updateRing(value, goal, id) {
        const circle = document.getElementById(id)
        const percent = Math.min(value / goal, 1)
        const offset = 314 - (314 * percent)
        circle.style.strokeDashoffset = offset
    }

    updateRing(totalCarbs, goals.carbs, 'ring-carbs')
    updateRing(totalFat, goals.fat, 'ring-fat')
    updateRing(totalProtein, goals.protein, 'ring-protein')

    // Update numbers
    document.getElementById('carbs-g').textContent = totalCarbs
    document.getElementById('fat-g').textContent = totalFat
    document.getElementById('protein-g').textContent = totalProtein

    // Prevent negative values
    document.getElementById('carbs-left').textContent =
        Math.max(0, goals.carbs - totalCarbs) + 'g left'

    document.getElementById('fat-left').textContent =
        Math.max(0, goals.fat - totalFat) + 'g left'

    document.getElementById('protein-left').textContent =
        Math.max(0, goals.protein - totalProtein) + 'g left'
    document.getElementById('remain-carbs').textContent =
    Math.max(0, 163 - totalCarbs) + 'g'

    document.getElementById('remain-protein').textContent =
        Math.max(0, 65 - totalProtein) + 'g'
    
    document.getElementById('remain-fat').textContent =
        Math.max(0, 43 - totalFat) + 'g'
    
    document.getElementById('remain-calories').textContent =
        Math.max(0, calorieGoal - totalCalories)
}

function addFoodToLog(foodName, calories, carbs, protein, fat) {
    const meal = getCurrentMeal()
    const detailItem = document.createElement('li')
    detailItem.textContent = foodName + ' — ' + calories + ' kcal'
    document.getElementById('detail-' + meal).appendChild(detailItem)

    totalCalories += calories
    totalCarbs    += carbs
    totalProtein  += protein
    totalFat      += fat
    mealCalories[meal] += calories
    weeklyData[todayIndex] += calories

    updateCalorieRing()
    updateWeeklyChart()
    updateMacros()

    document.getElementById('detail-kcal-' + meal).textContent = mealCalories[meal]

    const item = document.createElement('li')
    item.textContent = foodName + ' — ' + calories + ' kcal'
    document.getElementById('list-' + meal).appendChild(item)

    const list = document.getElementById('list-' + meal)
    const arrow = document.getElementById('arrow-' + meal)
    if (!list.classList.contains('open')) {
        list.classList.add('open')
        arrow.classList.add('open')
    }
}

addFoodBtn.addEventListener('click', function() {
    addFoodToLog('Chicken Rice', 450, 60, 25, 10)
})

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

    if (isFull) {
        triggerPandaHappy()
    }
}

function triggerPandaHappy() {
    const panda = document.getElementById('panda-mask-wrap')
    const container = document.getElementById('hearts-container')

    // spin + jump animation
    panda.classList.remove('happy')
    void panda.offsetWidth  
    panda.classList.add('happy')

    const starEmojis = ['⭐', '✨', '🌟', '💫']
    for (let i = 0; i < 8; i++) {
        setTimeout(function() {
            const star = document.createElement('span')
            star.textContent = starEmojis[Math.floor(Math.random() * starEmojis.length)]
            star.classList.add('star')
            // random direction using CSS variables
            const angle = Math.random() * 360
            const distance = 60 + Math.random() * 40
            const tx = Math.cos(angle) * distance + 'px'
            const ty = Math.sin(angle) * distance + 'px'
            star.style.setProperty('--tx', tx)
            star.style.setProperty('--ty', ty)
            star.style.left = '50%'
            star.style.top = '30%'
            container.appendChild(star)
            setTimeout(function() { star.remove() }, 1200)
        }, i * 80)
    }
}

addWaterBtn.addEventListener('click', function() {
    if (glasses < maxGlasses) {
        glasses++
        updateWater()
    }
})

removeWaterBtn.addEventListener('click', function() {
    if (glasses > 0) {
        glasses--
        updateWater()
    }
})

function getCurrentMeal() {
    const hour = new Date().getHours()
    if (hour < 11) return 'breakfast'
    if (hour < 16) return 'lunch'
    return 'dinner'

    const dayTotal = document.getElementById('day-total-kcal')
    if (dayTotal) dayTotal.textContent = totalCalories
}

function toggleMeal(meal) {
    const list = document.getElementById('list-' + meal)
    const arrow = document.getElementById('arrow-' + meal)
    list.classList.toggle('open')
    arrow.classList.toggle('open')
}
updateWeeklyChart()
updateMacros()