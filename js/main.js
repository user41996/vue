let eventBus = new Vue();

Vue.component('info-tabs', {
    props: {
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <div>
    <ul>
      <span class="tab" 
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab, index) in tabs"
            @click="selectedTab = tab"
            :key="tab"
      >{{ tab }}</span>
    </ul>
    <div v-show="selectedTab === 'Shipping'">
      <p>{{ shipping }}</p>
    </div>
    <div v-show="selectedTab === 'Details'">
      <ul>
        <li v-for="detail in details">{{ detail }}</li>
      </ul>
    </div>

  </div>
    `,
    data() {
        return {
            tabs: ['Shipping', 'Details'],
            selectedTab: 'Shipping'
        }
    }
})


Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },

    template: `
    <div>
          
            <ul>
              <span class="tab" 
                    :class="{ activeTab: selectedTab === tab }"
                    v-for="(tab, index) in tabs"
                    @click="selectedTab = tab"
                    :key="tab"
              >{{ tab }}</span>
            </ul>
            <div v-show="selectedTab === 'Reviews'">
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul v-else>
                    <li v-for="(review, index) in reviews" :key="index">
                      <p>{{ review.name }}</p>
                      <p>Rating:{{ review.rating }}</p>
                      <p>{{ review.review }}</p>
                      <p>{{ review.recommendation }}</p>
                    </li>
                </ul>
            </div>
            <div v-show="selectedTab === 'Make a Review'">
              <product-review></product-review>
            </div>
        
          </div>
        `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'  // устанавливается с помощью @click
        }
    }
})

Vue.component('product-review', {
    template: `

    <form class="review-form" @submit.prevent="onSubmit">

    <p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
 </p>

 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>

 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>

 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>

 <p>Would you recommend this product?</p>

    <label for="recommendation">Yes</label>
    <input type="radio" value="Recommendation" v-model="recommendation""/>

    <label for="recommendation">No</label>
    <input type="radio" value="No recommendation" v-model="recommendation"/>
 </p>
 <p>
   <input type="submit" value="Submit"> 
 </p>

</form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommendation: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = []
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommendation: this.recommendation
                }
                eventBus.$emit('review-submitted', productReview);
                this.name = null
                this.review = null
                this.rating = null
                this.recommendation = null
            }
            else {
                if(!this.name) this.errors.push("Name required.");
                if(!this.review) this.errors.push("Review required.");
                if(!this.rating) this.errors.push("Rating required.");
                if(!this.recommendation) this.errors.push("Recommendation required");
            }
        }
    }
})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    }
    ,

    template:`
        <div class="product" xmlns="http://www.w3.org/1999/html">  
           <div class="product-image">
               <img :src="image" :alt="altText"/>
           </div>
           <div class="product-info">
               <h1> {{title}} </h1>
               <p v-if="inStock">In stock</p>
               <p v-else-if="!inStock" style="text-decoration: line-through">Out of stock</p>
        <ul>
          <li v-for="detail in details">{{detail}}</li>     
<!--          8 практическая, над ней надо подумать-->
        </ul>
        <p>Shipping: {{shipping}}</p>
        <div class="color-box" 
        v-for="(variant, index) in variants" 
        :key="variant.variantId" 
        :style="{ backgroundColor:variant.variantColor }" 
        @mouseover="updateProduct(index)">
        </div>
        
<!--        <div class="cart">-->
<!--        <p>Cart({{cart}})</p>//счётчик(малый)-->
<!--        </div>-->

        <label>Sizes</label>
        <p>S:</p>
        <input type="radio" value="S" v-model="size">

        <p>M:</p>
        <input type="radio" value="M" v-model="size">

        <p>L:</p>
        <input type="radio" value="L" v-model="size">

        <p>XL:</p>
        <input type="radio" value="XL" v-model="size">

        <p>XXL:</p>
        <input type="radio" value="XXL" v-model="size">

        <p>XXXL:</p>
        <input type="radio" value="XXXL" v-model="size">

        <button v-on:click="addToCart" :disabled="!inStock" :class="{disabledButton:!inStock}">
        Add to cart
        </button><br>
        
        <button v-on:click="subtractionToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">
        Subtraction to cart
        </button>
        
        
        <a :href="link">More products like this</a><br>
        <span v-show="onSale">On sale</span>
        <p v-if="onSale">{{sale}}</p>
        <p v-else-if="!onSale">{{brand}} НЕ проводит распродажу {{product}}</p></div>
        <div>
        <product-tabs :reviews="reviews"></product-tabs>
        </div>
        </div>



`
        ,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            // inStock: false,
            onSale: true, //логическое свойство, которое указывает идёт ли сейчас распродажа данного товара
            inventory: 100,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 110,
                }
            ],
            // sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            size: null,
            carts: [],
            reviews:[],
        }
    },

    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
            this.$emit('add-to-cart', this.size);
        },
        // addSizeToCart() {
        //     this.$emit('add-to-cart', this.size);
        // },
        subtractionToCart(){
            this.$emit('subtraction-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        removeToCart() {
            this.cart -= 1;
        },
        updateCart(){
            this.cart += 1;
        },

    },

    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image(){
            return this.variants[this.selectedVariant].variantImage
        },
        // size(){
        //     return this.size 
        // },
        sale() {
            return this.brand + ' ' + 'проводит распрадажу' + ' ' + this.product;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return 2.99
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: false,
        carts:[]
    },
    methods: {
        updateCart(id){
            this.carts.push(id);
            this.carts.push(size);
            console.log(this.carts)
        },
        subtractionCart(){
            this.cart.pop();
        }
    }
})
