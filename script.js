let totalCalories = 0
let calorieGoal   = 2000
let glasses       = 0
let maxGlasses    = 8
let currentPage   = 0
let mealCalories  = { breakfast: 0, lunch: 0, dinner: 0 }

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

function addFoodToLog(foodName, calories) {
    const meal = getCurrentMeal()

    totalCalories += calories
    mealCalories[meal] += calories
    weeklyData[todayIndex] += calories

    updateCalorieRing()
    updateWeeklyChart()

    document.getElementById('kcal-' + meal).textContent = mealCalories[meal] + ' kcal'

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
    addFoodToLog('Chicken Rice', 450)
})

function updateWater() {
    glassesDrunk.textContent = glasses
    const percent = (glasses / maxGlasses) * 100

    const maxHeight = 110
    const fillHeight = (maxHeight * percent) / 100
    const fillY = 146 - fillHeight
    const fill = document.getElementById('panda-water-fill')
    fill.setAttribute('y', fillY)
    fill.setAttribute('height', fillHeight)


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
            // random horizontal position
            heart.style.left = (20 + Math.random() * 60) + '%'
            heart.style.animationDelay = (Math.random() * 0.3) + 's'
            container.appendChild(heart)
            // remove after animation
            setTimeout(function() { heart.remove() }, 1500)
        }, i * 100)
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
}

function toggleMeal(meal) {
    const list = document.getElementById('list-' + meal)
    const arrow = document.getElementById('arrow-' + meal)
    list.classList.toggle('open')
    arrow.classList.toggle('open')
}
updateWeeklyChart()