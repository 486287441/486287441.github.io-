// 全局变量声明
let foodData = [];

// 类型映射对象
const TYPE_MAP = {
    'meal': '正餐',
    'snack': '零食',
    'fruit': '水果',
    'drink': '饮品'
};

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    // 获取星级评分值
    const tasteRating = document.querySelector('.star-rating input[name="tasteRating"]').value;
    const healthRating = document.querySelector('.star-rating input[name="healthRating"]').value;
    
    console.log('Ratings:', { taste: tasteRating, health: healthRating }); // 调试日志

    // 收集表单数据
    const newFood = {
        id: Date.now(),
        name: document.getElementById('foodName').value,
        price: parseFloat(document.getElementById('price').value) || 0,
        tasteRating: parseInt(tasteRating),
        healthRating: parseInt(healthRating),
        types: Array.from(document.querySelectorAll('.type-tags input[type="checkbox"]:checked'))
            .map(checkbox => TYPE_MAP[checkbox.value]),
        notes: document.getElementById('notes').value,
        date: new Date().toISOString().split('T')[0],
        image: document.getElementById('imageData').value || null
    };

    console.log('New food with types:', newFood); // 调试日志

    // 添加到数据数组
    foodData.push(newFood);
    
    // 保存到 localStorage
    localStorage.setItem('foodData', JSON.stringify(foodData));
    
    // 重置表单
    e.target.reset();
    
    // 重置星级评分
    document.querySelectorAll('.star-rating').forEach(container => {
        container.dataset.rating = "1";
        container.querySelector('input[type="hidden"]').value = "1";
    });
    
    // 重置图片预览
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imageData').value = '';
    
    // 刷新显示
    displayFoodItems();
}

// 添加示例数据函数
function addInitialData() {
    const initialData = [
        {
            id: Date.now() - 5000,
            name: "红烧狮子头",
            price: 38.00,
            tasteRating: 5,
            healthRating: 4,
            types: ["正餐"],
            notes: "肉质鲜嫩，调味适中",
            date: "2024-03-15"
        },
        {
            id: Date.now() - 4000,
            name: "抹茶拿铁",
            price: 22.00,
            tasteRating: 4,
            healthRating: 3,
            types: ["饮品"],
            notes: "抹茶味浓郁",
            date: "2024-03-14"
        },
        {
            id: Date.now() - 3000,
            name: "草莓蛋糕",
            price: 28.00,
            tasteRating: 5,
            healthRating: 2,
            types: ["零食"],
            notes: "新鲜草莓，口感绝佳",
            date: "2024-03-13"
        }
    ];

    return initialData;
}

// 修改页面加载初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    
    // 从 localStorage 加载数据
    const savedData = localStorage.getItem('foodData');
    if (savedData) {
        foodData = JSON.parse(savedData);
        console.log('Loaded saved data:', foodData);
    } else {
        // 如果没有保存的数据，使用初始数据
        foodData = addInitialData();
        // 保存到 localStorage
        localStorage.setItem('foodData', JSON.stringify(foodData));
        console.log('No saved data found, added initial data:', foodData);
    }
    
    // 初始化表单提交事件
    const form = document.getElementById('foodForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        console.log('Form submit handler attached');
    }
    
    // 初始化其他功能
    initializeStarRatings();
    initializeFilters();
    
    // 显示现有数据
    displayFoodItems();
    initDevTools();
    
    // 自动调整文本框高度
    const textarea = document.getElementById('notes');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
});

// 显示食物记录
function displayFoodItems() {
    const foodGrid = document.getElementById('foodGrid');
    if (!foodGrid) {
        console.error('Food grid element not found!');
        return;
    }

    // 应用筛选和排序
    const filteredData = applyFilters(foodData);
    console.log('Filtered data:', filteredData);

    if (filteredData.length === 0) {
        foodGrid.innerHTML = '<div class="no-results">没有找到符合条件的记录</div>';
        return;
    }

    // 显示所有数据，修改备注的显示逻辑
    foodGrid.innerHTML = filteredData.map(item => `
        <div class="food-card">
            ${item.image ? `
                <div class="food-image">
                    <img src="${item.image}" alt="${item.name}" onclick="showFullImage('${item.image}')">
                </div>
            ` : ''}
            <div class="food-info">
                <h3>${item.name}</h3>
                <p class="price">￥${item.price.toFixed(2)}</p>
                <p class="rating taste">好吃度: <span class="stars">${'★'.repeat(item.tasteRating)}</span></p>
                <p class="rating health">健康度: <span class="stars">${'★'.repeat(item.healthRating)}</span></p>
                <p class="types">类型: ${item.types.join(', ')}</p>
                <p class="date">日期: ${item.date}</p>
                <p class="notes">备注: ${item.notes || '无'}</p>
            </div>
            <div class="card-actions">
                <button onclick="editFoodItem(${item.id})">编辑</button>
                <button onclick="deleteFoodItem(${item.id})">删除</button>
            </div>
        </div>
    `).join('');
}

// 创建食物卡片
function createFoodCard(item) {
    const createStars = (rating) => {
        return '★'.repeat(parseInt(rating));
    };

    return `
        <div class="food-card">
            <div class="food-info">
                <h3>${item.name}</h3>
                <p class="price">￥${item.price.toFixed(2)}</p>
                <p class="rating taste">好吃度: <span class="stars">${createStars(item.tasteRating)}</span></p>
                <p class="rating health">健康度: <span class="stars">${createStars(item.healthRating)}</span></p>
                <p class="types">类型: ${item.types.join(', ')}</p>
                <p class="date">日期: ${item.date}</p>
                ${item.notes ? `<p class="notes">备注: ${item.notes}</p>` : ''}
            </div>
            <div class="card-actions">
                <button onclick="editFoodItem(${item.id})">编辑</button>
                <button onclick="deleteFoodItem(${item.id})">删除</button>
            </div>
        </div>
    `;
}

// 添加测试功能
function initDevTools() {
    const devPanel = document.querySelector('.dev-panel');
    
    // 按 D 键显示/隐藏开发面板
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'd') {
            devPanel.classList.toggle('show');
        }
    });
}

// 测试功能函数
function resetData() {
    localStorage.clear();
    location.reload();
}

function clearData() {
    foodData = [];
    localStorage.setItem('foodData', JSON.stringify(foodData));
    displayFoodItems();
}

function addTestData() {
    const testItem = {
        id: Date.now(),
        name: "测试食物" + Math.floor(Math.random() * 100),
        price: Math.floor(Math.random() * 100),
        tasteRating: Math.floor(Math.random() * 5) + 1,
        healthRating: Math.floor(Math.random() * 5) + 1,
        types: ["正餐"],
        notes: "测试数据",
        date: new Date().toISOString().split('T')[0]
    };
    
    foodData.push(testItem);
    localStorage.setItem('foodData', JSON.stringify(foodData));
    displayFoodItems();
}

// 修改星级评分初始化函数
function initializeStarRatings() {
    document.querySelectorAll('.star-rating').forEach(container => {
        const stars = container.querySelectorAll('.star');
        const input = container.querySelector('input[type="hidden"]');

        stars.forEach(star => {
            // 点击事件
            star.addEventListener('click', () => {
                const value = star.dataset.value;
                container.dataset.rating = value;
                input.value = value;
                console.log('Star rating updated:', { 
                    inputName: input.name, 
                    value: value 
                }); // 调试日志
            });

            // 鼠标悬停事件
            star.addEventListener('mouseenter', () => {
                const value = star.dataset.value;
                updateStars(container, value);
            });
        });

        // 鼠标离开评分区域时恢复实际评分
        container.addEventListener('mouseleave', () => {
            updateStars(container, input.value);
        });
    });
}

// 更新星星显示状态
function updateStars(container, value) {
    const stars = container.querySelectorAll('.star');
    stars.forEach(star => {
        if (star.dataset.value <= value) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// 修改编辑功能中的类型处理
function editFoodItem(id) {
    const item = foodData.find(item => item.id === id);
    if (!item) return;

    // 填充表单
    document.getElementById('foodName').value = item.name;
    document.getElementById('price').value = item.price;
    document.getElementById('notes').value = item.notes || '';
    
    // 设置类型选中状态（需要反向查找英文值）
    document.querySelectorAll('.type-tags input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = item.types.includes(TYPE_MAP[checkbox.value]);
    });
    
    // 设置评分
    document.querySelector('[name="tasteRating"]').closest('.star-rating').dataset.rating = item.tasteRating;
    document.querySelector('[name="healthRating"]').closest('.star-rating').dataset.rating = item.healthRating;
    document.getElementById('tasteRating').value = item.tasteRating;
    document.getElementById('healthRating').value = item.healthRating;

    // 设置图片预览
    if (item.image) {
        document.getElementById('imagePreview').src = item.image;
        document.getElementById('imagePreview').style.display = 'block';
        document.getElementById('imageData').value = item.image;
    }

    // 删除原记录
    foodData = foodData.filter(food => food.id !== id);
    saveFoodData();
    displayFoodItems();
}

// 删除功能
function deleteFoodItem(id) {
    if (confirm('确定要删除这条记录吗？')) {
        foodData = foodData.filter(item => item.id !== id);
        localStorage.setItem('foodData', JSON.stringify(foodData));
        displayFoodItems();
    }
}

// 修改筛选功能初始化
function initializeFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 排序按钮互斥
            if (btn.id && btn.id.startsWith('sortBy')) {
                document.querySelectorAll('[id^="sortBy"]').forEach(sortBtn => {
                    if (sortBtn !== btn) sortBtn.classList.remove('active');
                });
            }
            
            // 类型按钮互斥（如果是类型按钮）
            if (btn.dataset.type) {
                document.querySelectorAll('.filter-btn[data-type]').forEach(typeBtn => {
                    if (typeBtn !== btn) {
                        typeBtn.classList.remove('active');
                    }
                });
            }
            
            btn.classList.toggle('active');
            displayFoodItems();
        });
    });
}

// 应用筛选和排序
function applyFilters(data) {
    let result = [...data];
    
    // 1. 应用评分筛选
    if (document.getElementById('filterGoodTaste')?.classList.contains('active')) {
        result = result.filter(item => item.tasteRating >= 4);
    }
    if (document.getElementById('filterHealthy')?.classList.contains('active')) {
        result = result.filter(item => item.healthRating >= 4);
    }
    
    // 2. 应用类型筛选
    const activeTypeButtons = document.querySelectorAll('.filter-btn[data-type].active');
    if (activeTypeButtons.length > 0) {
        const selectedTypes = Array.from(activeTypeButtons)
            .map(btn => TYPE_MAP[btn.dataset.type]);
        result = result.filter(item => 
            item.types.some(type => selectedTypes.includes(type))
        );
    }
    
    // 3. 应用排序
    const activeSortBtn = document.querySelector('[id^="sortBy"].active');
    if (activeSortBtn) {
        switch (activeSortBtn.id) {
            case 'sortByTaste':
                result.sort((a, b) => b.tasteRating - a.tasteRating);
                break;
            case 'sortByHealth':
                result.sort((a, b) => b.healthRating - a.healthRating);
                break;
            case 'sortByDate':
                result.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }
    }
    
    return result;
}

// 添加图片处理相关函数
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // 显示预览
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            // 保存图片数据到隐藏输入框
            document.getElementById('imageData').value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// 添加图片全屏显示功能
function showFullImage(src) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <img src="${src}" alt="Full size image">
            <button onclick="this.parentElement.parentElement.remove()">关闭</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // 点击模态框背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
} 