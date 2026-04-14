const foodPhoto = document.getElementById('food-photo')
const preview = document.getElementById('preview')
const analyzeBtn = document.getElementById('analyze-btn')
const loglist = document.getElementById('log-list')
const totalDisplay = document.getElementById('total')

let totalCalories = 0

foodPhoto.addEventListener('change', function() {
    const file = foodPhoto.files[0]

    if (file) {
        const reader = new FileReader()

        reader.onload = function(e) {
            preview.src = e.target.result
            preview.style.display = 'block'
        }

        reader.readAsDataURL(file)
    }
})

analyzeBtn.addEventListener ('click', function() {
    addFoodToLog('Chicken Rice', 450)
})

function addFoodToLog(foodName, calories) {
    totalCalories += calories
    totalDisplay.textContent = totalCalories

    const item = document.createElement('li')
    item.textContent = foodName + ' — ' + calories + ' kcal'
    loglist.appendChild(item)
}