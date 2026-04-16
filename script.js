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
const calorieRing = document.getElementById('calorie-ring')
const caloriesEaten = document.getElementById('calories-eaten')
const addFoodBtn =document.getElementById('add-food-btn')
const addWaterBtn = document.getElementById('add-water')
const removeWaterBtn = document.getElementById('remove-water')
const waterFill = document.getElementById('water-fill')
const glassesDrunk = document.getElementById('glasses-drunk')

let startX = 0

slider.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX
})

slider.addEventListener('touchend', function(e) {
    const endX = e.changedTouches[0].clientX
    const diff = startX - endX

    if (diff > 50) goToPage(1)
    if (diff < -50) goToPage(0)
})

dot1.addEventListener('click', function() { goToPage(0) })
dot2.addEventListener('click', function() { goToPage(1) })

function goToPage(pageIndex) {
    currentPage = pageIndex
    const pageWidth = slider.parentElement.offsetWidth
    slider.style.transform = `translateX(-${pageIndex * pageWidth}px)`

    dot1.classList.toggle('active', pageIndex === 0)
    dot2.classList.toggle('active', pageIndex === 1)
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
    waterFill.style.height = percent + '%'
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