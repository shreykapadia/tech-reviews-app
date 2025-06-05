
/**
 * Normalizes a numerical score from its original scale to a target scale using Min-Max normalization.
 */
 function normalizeScore(score, scale, targetScale) {
  let originalMax;

  if (scale === 'out of 10') {
    originalMax = 10;
  } else if (scale === 'out of 5 stars') {
    originalMax = 5;
  } else if (scale === 'percent') {
    originalMax = 100;
  } else {
    console.warn(`Unknown or invalid scale: ${scale}`);
    return null;
  }

  if (score === null || typeof score !== 'number' || isNaN(score)) {
    return null;
  }
  
  if (originalMax === 0) {
    return null;
  }

  if (scale === 'percent') {
      return (score / 100) * targetScale;
  } else {
      return (score / originalMax) * targetScale;
  }
}

/**
 * Calculates a weighted average Critics Score from an array of critic reviews.
 */
// criticWeightsData will be a global variable, populated in DOMContentLoaded
function calculateCriticsScore(criticReviews) {
  if (!criticWeightsData || Object.keys(criticWeightsData).length === 0) {
    console.warn("Critic weights not loaded or empty. Cannot calculate critics score.");
    return null;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  criticReviews.forEach(review => {
    const normalizedScore = normalizeScore(review.score, review.scale, 100);
    if (normalizedScore !== null) {
      let publicationWeight = criticWeightsData[review.publication];
      if (typeof publicationWeight !== 'number' || isNaN(publicationWeight)) {
        publicationWeight = criticWeightsData.default; // Fallback to default weight
      }

      if (typeof publicationWeight === 'number' && !isNaN(publicationWeight)) {
        totalWeightedScore += normalizedScore * publicationWeight;
        totalWeight += publicationWeight;
      } else {
        console.warn(`No valid weight found for publication "${review.publication}" (and no valid default). Skipping this review score.`);
      }
    }
  });

  return totalWeight === 0 ? null : totalWeightedScore / totalWeight;
}

/**
 * Displays product details on the page.
 */
function showProductDetail(product) { // Replaced with version from index.html for grid display
    // productListDiv and productDetailDiv are now defined globally below


    if (productListDiv) productListDiv.classList.add('hidden'); // Target #product-list
    if (productDetailDiv) productDetailDiv.classList.remove('hidden'); // Target #product-detail


    // Populate product detail elements
    document.getElementById('product-detail-image').src = product.imageURL;
    document.getElementById('product-detail-image').alt = product.productName;
    document.getElementById('product-detail-name').textContent = product.productName;
    document.getElementById('product-detail-brand').textContent = product.brand;
    document.getElementById('product-detail-category').textContent = product.category;

    const criticsScore = calculateCriticsScore(product.criticReviews);
    if (criticsScore !== null) {
        document.getElementById('product-detail-critics-score').textContent = `${Math.round(criticsScore)}/100`;
    } else {
        document.getElementById('product-detail-critics-score').textContent = `N/A`;
    }
    document.getElementById('product-detail-audience-rating').textContent = product.audienceRating;

    const productDetailSpecs = document.getElementById('product-detail-key-specs');
    productDetailSpecs.innerHTML = '';
    for (const key in product.keySpecs) {
        if (product.keySpecs.hasOwnProperty(key)) {
            const listItem = document.createElement('li');
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            listItem.textContent = `${formattedKey}: ${product.keySpecs[key]}`;
            productDetailSpecs.appendChild(listItem);
        }
    }

    // const productDetailPros = document.getElementById('product-detail-pros');
    // productDetailPros.innerHTML = '';
    // // Safely access pros if aiProsCons and its 'pros' property exist
    // if (product.aiProsCons && Array.isArray(product.aiProsCons.pros)) {
    //     product.aiProsCons.pros.forEach(pro => {
    //         const listItem = document.createElement('li');
    //         listItem.textContent = pro;
    //         productDetailPros.appendChild(listItem);
    //     });
    // }

    // // const productDetailCons = document.getElementById('product-detail-cons');
    // // productDetailCons.innerHTML = '';
    // // // Safely access cons if aiProsCons and its 'cons' property exist
    // // if (product.aiProsCons && Array.isArray(product.aiProsCons.cons)) {
    // //     product.aiProsCons.cons.forEach(con => {
    // //         const listItem = document.createElement('li');
    // //         listItem.textContent = con;
    // //         productDetailCons.appendChild(listItem);
    // //     });
    // // }
    // const prosConsToggleButton = document.getElementById('pros-cons-toggle-btn');
    // // For <details>/<summary>, we ensure the <details> element is closed when a new product is shown.
    // if (prosConsToggleButton) {
    //     const detailsElement = prosConsToggleButton.closest('details');
    //     if (detailsElement) {
    //     detailsElement.open = false;
    //     }
    // }
}

// Get references to the main product list and detail containers
const productListDiv = document.getElementById('product-list');
const productDetailDiv = document.getElementById('product-detail');

/**
 * Creates a product card DOM element.
 * @param {object} product - The product data.
 * @param {function} onCardClickCallback - Callback function when the card is clicked.
 * @returns {HTMLElement} The product card element.
 */
function createProductCardElement(product, onCardClickCallback) {
    const criticsScore = calculateCriticsScore(product.criticReviews);
    let scoreDisplay = 'N/A';
    let scoreBadgeClass = 'score-avg';

    if (criticsScore !== null && !isNaN(criticsScore)) { // Add check for NaN
        const roundedScore = Math.round(criticsScore);
        scoreDisplay = `${roundedScore}/100`;
        if (roundedScore >= 85) scoreBadgeClass = 'score-excellent';
        else if (roundedScore >= 70) scoreBadgeClass = 'score-good';
    }

    const productCard = document.createElement('div');
    // Classes for a grid item card. Removed carousel-specific and fixed-width classes.
    // The grid container (#product-list) will manage sizing and spacing.
    productCard.classList.add(
        'block', 'bg-white', 'rounded-xl', 'shadow-lg', 'p-6',
        'transform', 'hover:scale-103', 'transition-all', 'duration-300',
        'border', 'border-gray-100', 'hover:border-blue-200',
        'flex', 'flex-col', 'justify-between', 'cursor-pointer',
        'overflow-hidden', 'group'
    );
    productCard.innerHTML = `
        <div>
            <div class="flex justify-center mb-4 overflow-hidden rounded-lg">
                <img src="${product.imageURL}" alt="${product.productName}" class="max-w-full h-auto rounded-lg object-cover transform group-hover:scale-110 transition-transform duration-300">
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-1 leading-tight">${product.productName}</h3>
            <p class="text-sm text-gray-500 mb-4">Brand: <span class="font-semibold text-gray-600">${product.brand}</span></p>
            <div class="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-4 mb-4">
                <div class="flex items-center space-x-2">
                    <span class="score-badge ${scoreBadgeClass}">${scoreDisplay}</span>
                    <span class="text-sm font-medium text-gray-600">Critics Score</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-lg text-yellow-500">&#9733;</span>
                    <span class="text-sm font-medium text-gray-600">${product.audienceRating} Audience Rating</span>
                </div>
            </div>
        </div>
        <button class="mt-4 w-full px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-base font-medium opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
            View Details
        </button>
    `;
    if (onCardClickCallback && typeof onCardClickCallback === 'function') {
        productCard.addEventListener('click', () => onCardClickCallback(product));
    }
    return productCard;
}

function displayProducts(products) {
  const productListDiv = document.getElementById('product-list');
  console.log("displayProducts called.");
  productListDiv.innerHTML = ''; // Clear existing content

  if (!products || products.length === 0) {
      console.log("displayProducts: No products data found or data is empty.");
      productListDiv.innerHTML = '<p class="text-center text-gray-600 col-span-full">No products found.</p>';
      return;
  }

  products.forEach(product => {
    const criticsScore = calculateCriticsScore(product.criticReviews);
    let scoreDisplay = 'N/A';
    let scoreBadgeClass = 'score-avg';

    if (criticsScore !== null && !isNaN(criticsScore)) { // Ensure score is a valid number
        const roundedScore = Math.round(criticsScore);
        scoreDisplay = `${roundedScore}/100`;
        if (roundedScore >= 85) scoreBadgeClass = 'score-excellent';
        else if (roundedScore >= 70) scoreBadgeClass = 'score-good';
    }
    try {
        // Use the refactored createProductCardElement function
        const productCard = createProductCardElement(product, showProductDetail);
        productListDiv.appendChild(productCard);
    } catch (error) {
        console.error(`displayProducts: Error creating or appending card for product ${product.productName || 'Unknown'}:`, error);
    }
  });
  console.log("displayProducts finished.");
}


// This variable will hold the fetched product data
let productsData = {}; // Initialize as object, as products.json is now an object
let criticWeightsData = {}; // To store weights from criticWeights.json

// Function to apply filters
// Function to apply filters
function applyFilters() {
    // Ensure data is loaded before filtering. productsData is now an object.
    if (Object.keys(productsData).length === 0 || Object.keys(criticWeightsData).length === 0) {
        console.log("applyFilters called, but data (products or weights) not yet fully loaded or empty.");
        displayProducts([]); // Display no products if data isn't ready
        return;
    }
    console.log("applyFilters called. productsData categories:", Object.keys(productsData).length, "criticWeightsData keys:", Object.keys(criticWeightsData).length);
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const selectedCategory = categoryFilter ? categoryFilter.value : "all";

    let productsToFilter = [];

    if (selectedCategory === 'all') {
        // Flatten all products from all categories
        for (const categoryKey in productsData) {
            if (productsData.hasOwnProperty(categoryKey) && Array.isArray(productsData[categoryKey])) {
                productsToFilter = productsToFilter.concat(productsData[categoryKey]);
            }
        }
    } else if (productsData[selectedCategory] && Array.isArray(productsData[selectedCategory])) {
        // Use only products from the selected category
        productsToFilter = productsData[selectedCategory];
    } else {
        // Selected category does not exist in data or is not an array
        console.warn(`Category "${selectedCategory}" not found or invalid in productsData.`);
        productsToFilter = [];
    }

    const filteredProducts = productsToFilter.filter(product => {
        const matchesSearchTerm =
            product.productName.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm);
        // Category filtering is already handled by how productsToFilter is constructed
        return matchesSearchTerm;
    });
    displayProducts(filteredProducts); // displayProducts expects an array
}

// Get references to the HTML elements for filtering (moved here for scope)
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// Function to populate the category filter dropdown
function populateCategoryFilter(categories) {
    if (!categoryFilter) return;

    // Preserve the "All Categories" option if it exists, or create it
    let allOption = categoryFilter.querySelector('option[value="all"]');
    categoryFilter.innerHTML = ''; // Clear existing options
    if (!allOption) {
        allOption = document.createElement('option');
        allOption.value = "all";
        allOption.textContent = "All Categories";
    }
    categoryFilter.appendChild(allOption);

    categories.sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}
// Consolidated DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded: Main Setup Initiated.");

    try {
        // Fetch both products and critic weights concurrently
        const [productsResponse, weightsResponse] = await Promise.all([
            fetch('js/products.json'),
            fetch('js/criticWeights.json')
        ]);

        if (!productsResponse.ok) {
            throw new Error(`HTTP error! status: ${productsResponse.status} for products.json`);
        }
        if (!weightsResponse.ok) {
            throw new Error(`HTTP error! status: ${weightsResponse.status} for criticWeights.json`);
        }

        productsData = await productsResponse.json();
        // --- Start Enhanced Debug Logging ---
        console.log("Fetched products.json. Status:", productsResponse.status);
        console.log("Raw productsData after parsing:", productsData);
        if (productsData === null) {
            console.log("Detailed check: productsData is null.");
        } else if (typeof productsData !== 'object') {
            console.log("Detailed check: productsData is not an object. Type:", typeof productsData);
        } else if (Array.isArray(productsData)) {
            console.log("Detailed check: productsData is an array. Length:", productsData.length);
        } else {
            console.log("Detailed check: productsData is an object. Keys:", Object.keys(productsData));
        }
        // --- End Enhanced Debug Logging ---

        criticWeightsData = await weightsResponse.json(); // Store fetched weights
        console.log("Fetched criticWeights.json. Status:", weightsResponse.status, "Data:", criticWeightsData);

        // productsData is now an object, so check Object.keys().length
        const productsLoaded = productsData && Object.keys(productsData).length > 0;
        const weightsLoaded = criticWeightsData && Object.keys(criticWeightsData).length > 0;
        if (productsLoaded) {
            populateCategoryFilter(Object.keys(productsData)); // Populate categories as soon as product data is available
        }

        if (productsLoaded && weightsLoaded) { // Apply filters only when all data is ready
            console.log("Products data loaded successfully:", productsData);
            console.log("Critic weights loaded successfully:", criticWeightsData);
            console.log("DOMContentLoaded: All data fetched successfully. Populated categories and applying initial filters/display.");
            applyFilters();
        } else {
            let errorMessage = "Could not load necessary data. ";
            if (!productsLoaded) {
                console.error("DOMContentLoaded: Fetched productsData is empty or undefined.");
                errorMessage += "Products data missing. ";
            }
            if (!weightsLoaded) {
                console.error("DOMContentLoaded: Fetched criticWeightsData is empty or undefined.");
                errorMessage += "Critic weights missing. ";
            }
            if (productListDiv) { // Use the globally defined productListDiv
                productListDiv.innerHTML = `<p class="text-center text-gray-600 col-span-full">${errorMessage.trim()}</p>`;
            }
        }
    } catch (error) {
        console.error("DOMContentLoaded: Error fetching or parsing data:", error);
        if (productListDiv) productListDiv.innerHTML = '<p class="text-center text-gray-600 col-span-full">Could not load product data or critic weights.</p>';
    }

    // Event listener for 'Back to Products' button
    const backButton = document.getElementById('back-to-products-btn');
    if (backButton) {
        backButton.addEventListener('click', () => {
            const productDetailDiv = document.getElementById('product-detail');
            if (productDetailDiv) productDetailDiv.classList.add('hidden'); // productListDiv is global
            if (productListDiv) productListDiv.classList.remove('hidden');
        });
    }

    // Event listeners for search and filter changes
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    // Optional: Smooth scroll for fixed header (if desired for navigation)
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Prevent default only if the href is a hash and corresponds to an element
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetId && targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    console.log("DOMContentLoaded: Main Setup Finished.");
});
