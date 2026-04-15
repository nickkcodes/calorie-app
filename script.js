const slider = document.querySelector('.slider')
const dot1 = document.getElementById('dot-1')
const dot2 = document.getElementById('dot-2')
const calorieRing = document.getElementById('calorie-ring')
const caloriesEaten = document.getElementById('calories-eaten')
const loglist = document.getElementById('log-list')
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
    slider.style.transform = `translateX(-${pageIndex * 390}px)`

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

function addFoodToLog(foodName, calories) {
    totalCalories += calories
    updateCalorieRing()

    const item = document.createElement('li')
    item.textContent = foodName + ' — ' + calories + ' kcal'
    loglist.appendChild(item)
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