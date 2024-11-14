document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
});

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
        return `${remainingMinutes}min`;
    } else if (remainingMinutes === 0) {
        return `${hours}h`;
    } else {
        return `${hours}h ${remainingMinutes}min`;
    }
}

async function loadRecipes() {
    try {
        const response = await fetch('recipes.json');
        const recipes = await response.json();
        
        const recipeList = document.querySelector('.recipe-list');
        const recipeDisplay = document.querySelector('.recipe-display');

        recipes.forEach(recipe => {
            const recipeCard = document.createElement('article');
            recipeCard.className = 'recipe-card-preview';
            recipeCard.innerHTML = `
                <h3>${recipe.name}</h3>
                <p class="cuisine-tag">${recipe.cuisine}</p>
            `;
            
            recipeCard.addEventListener('click', () => {
                console.log('Recipe data:', recipe);
                
                document.querySelectorAll('.recipe-card-preview').forEach(card => {
                    card.classList.remove('active');
                });
             
                recipeCard.classList.add('active');
                
                let isDoubled = false;
                
                const newHTML = `
                    <div class="recipe-full">
                        <div class="recipe-header">
                            <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
                            <h2>${recipe.name}</h2>
                            <p class="description">${recipe.description}</p>
                        </div>
                        
                        <div class="recipe-meta">
                            <span><i class="time-icon"></i>Prep: ${formatTime(recipe.prepTime)}</span>
                            <span><i class="cook-icon"></i>Cook: ${formatTime(recipe.cookTime)}</span>
                            <span><i class="serving-icon"></i>Serves: <span class="servings-count">${recipe.servings}</span></span>
                            <span><i class="difficulty-icon"></i>Difficulty: ${recipe.difficulty}</span>
                        </div>

                        <div class="recipe-controls">
                            <button type="button" class="double-servings-btn recipe-button">Double Servings</button>
                            <button type="button" class="convert-units-btn recipe-button">Convert to Imperial</button>
                        </div>

                        <div class="recipe-content">
                            <div class="ingredients">
                                <h3>Ingredients</h3>
                                <ul class="ingredients-list">
                                    ${recipe.ingredients.map(ing => 
                                        `<li data-original-amount="${ing.amount}" data-original-unit="${ing.unit}">${ing.amount} ${ing.unit} ${ing.item}</li>`
                                    ).join('')}
                                </ul>
                            </div>

                            <div class="instructions">
                                <h3>Instructions</h3>
                                <ol>
                                    ${recipe.instructions.map(inst => 
                                        `<li>${inst.text}</li>`
                                    ).join('')}
                                </ol>
                            </div>
                        </div>
                    </div>
                `;

                recipeDisplay.innerHTML = newHTML;

                const doubleServingsBtn = recipeDisplay.querySelector('.double-servings-btn');
                
                if (doubleServingsBtn) {
                    doubleServingsBtn.addEventListener('click', () => {
                        console.log('Button clicked!');
                        isDoubled = !isDoubled;
                        const multiplier = isDoubled ? 2 : 1;
                        const servingsElement = recipeDisplay.querySelector('.servings-count');
                        const ingredientsList = recipeDisplay.querySelectorAll('.ingredients-list li');
                        
                        servingsElement.textContent = recipe.servings * multiplier;
                        
                        ingredientsList.forEach(li => {
                            const originalAmount = parseFloat(li.dataset.originalAmount);
                            const newAmount = originalAmount * multiplier;
                            li.textContent = `${newAmount} ${li.textContent.split(' ').slice(1).join(' ')}`;
                        });
                        doubleServingsBtn.textContent = isDoubled ? 'Reset Servings' : 'Double Servings';
                    });
                } else {
                    console.log('Double servings button not found');
                }

                const convertUnitsBtn = recipeDisplay.querySelector('.convert-units-btn');
                let isImperial = false;

                if (convertUnitsBtn) {
                    convertUnitsBtn.addEventListener('click', () => {
                        isImperial = !isImperial;
                        const ingredientsList = recipeDisplay.querySelectorAll('.ingredients-list li');
                        
                        ingredientsList.forEach(li => {
                            const originalAmount = parseFloat(li.dataset.originalAmount);
                            const originalUnit = li.dataset.originalUnit;
                            const currentAmount = isDoubled ? originalAmount * 2 : originalAmount;
                            
                            let newAmount, newUnit;
                            
                            switch(originalUnit.toLowerCase()) {
                                case 'grams':
                                    newAmount = isImperial ? (currentAmount * 0.00220462).toFixed(2) : currentAmount;
                                    newUnit = isImperial ? 'pounds' : 'grams';
                                    break;
                                case 'cups':
                                    newAmount = currentAmount;
                                    newUnit = originalUnit;
                                    break;
                                case 'ml':
                                    newAmount = isImperial ? (currentAmount * 0.033814).toFixed(2) : currentAmount;
                                    newUnit = isImperial ? 'fl oz' : 'ml';
                                    break;
                                default:
                                    newAmount = currentAmount;
                                    newUnit = originalUnit;
                            }
                            
                            const itemText = li.textContent.split(' ').slice(2).join(' ');
                            li.textContent = `${newAmount} ${newUnit} ${itemText}`;
                        });
                        
                        convertUnitsBtn.textContent = isImperial ? 'Convert to Metric' : 'Convert to Imperial';
                    });
                } else {
                    console.log('Convert units button not found');
                }
            });
            
            recipeList.appendChild(recipeCard);
        });
    } catch (error) {
        console.log('Error loading recipes:', error);
    }
} 