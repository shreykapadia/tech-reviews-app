
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
 function calculateCriticsScore(criticReviews) {
  const weights = {
    "CNET": 1.2, "TechRadar": 1.1, "The Verge": 1.1, "PCMag": 1.0,
    "Engadget": 1.0, "Ars Technica": 0.9, "Tom's Guide": 0.9, "Wired": 0.8,
    "RTINGS.com": 1.2, "FlatpanelsHD": 1.1, "What Hi-Fi?": 1.0,
    "Digital Trends": 0.9, "default": 0.7
  };

  let totalWeightedScore = 0;
  let totalWeight = 0;

  criticReviews.forEach(review => {
    const normalizedScore = normalizeScore(review.score, review.scale, 100);
    if (normalizedScore !== null) {
      const publicationWeight = weights[review.publication] || weights.default;
      totalWeightedScore += normalizedScore * publicationWeight;
      totalWeight += publicationWeight;
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

    const productDetailPros = document.getElementById('product-detail-pros');
    productDetailPros.innerHTML = '';
    product.aiProsCons.pros.forEach(pro => {
        const listItem = document.createElement('li');
        listItem.textContent = pro;
        productDetailPros.appendChild(listItem);
    });

    const productDetailCons = document.getElementById('product-detail-cons');
    productDetailCons.innerHTML = '';
    product.aiProsCons.cons.forEach(con => {
        const listItem = document.createElement('li');
        listItem.textContent = con;
        productDetailCons.appendChild(listItem);
    });

    const prosConsToggleButton = document.getElementById('pros-cons-toggle-btn');
    // For <details>/<summary>, we ensure the <details> element is closed when a new product is shown.
    if (prosConsToggleButton) {
        const detailsElement = prosConsToggleButton.closest('details');
        if (detailsElement) {
        detailsElement.open = false;
        }
    }
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
let productsData = [];

// Function to apply filters
function applyFilters() {
    console.log("applyFilters called. productsData length:", productsData.length); // Log productsData
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""; // searchInput is now defined below
    const selectedCategory = categoryFilter ? categoryFilter.value : "all";

    const filteredProducts = productsData.filter(product => { // productsData will be populated by fetch
        const matchesSearchTerm =
            product.productName.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm);
        const matchesCategory =
            selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearchTerm && matchesCategory;
    });
    console.log("Filtered products count:", filteredProducts.length);
    displayProducts(filteredProducts);
}

// Get references to the HTML elements for filtering (moved here for scope)
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

// Consolidated DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', async () => { // Make it async
    console.log("DOMContentLoaded: Main Setup Initiated (merged).");

    try {
        const response = await fetch('js/products.json'); // Path to your new JSON file
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        productsData = await response.json(); // Assign fetched data to the global productsData

        if (productsData && productsData.length > 0) {
            console.log("Products data loaded successfully:", productsData);
            console.log("DOMContentLoaded: productsData fetched successfully. Applying initial filters/display.");
            applyFilters(); // Now call applyFilters, which uses the fetched productsData
        } else {
            console.error("DOMContentLoaded: Fetched productsData is empty or undefined.");
            if (productListDiv) { // Use the globally defined productListDiv
                productListDiv.innerHTML = '<p class="text-center text-gray-600 col-span-full">No products found.</p>';
            }
        }
    } catch (error) {
        console.error("DOMContentLoaded: Error fetching or parsing productsData:", error);
        if (productListDiv) productListDiv.innerHTML = '<p class="text-center text-gray-600 col-span-full">Could not load product data.</p>';
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

    console.log("DOMContentLoaded: Main Setup Finished (merged).");
});
