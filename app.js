var budgetController = (function(){

    
    //expense constructor
    var  Expense = function(id,description,value){
        
        this.id = id;
        this.description = description;
        this.value = value,
        this.percentage = -1


    }; 
    
    Expense.prototype.calculatePercentage = function(totalIncome){

        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome)*100);
        }
            
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage
    }

   //income constructor
   var  Income = function(id,description,value){
        
    this.id = id;
    this.description = description;
    this.value = value

   };   

   var data = {

        allItems : {
            
            exp : [],
            inc : []
        },

        allTotals : {

            exp : 0,
            inc : 0
        },

        budget : 0,
        percentage : -1
   }

   var calculateTotal = function(type){
    var sum = 0;

    data.allItems[type].forEach(function(curr){

    sum += curr.value
    })

    data.allTotals[type] = sum;

   }


   return{

        addItem : function(type,description,value){

            var newItem, ID;

            //the logic for ID would be the last id +1

            //CHECKING IF THE ARRAY IS EMPTY OR NOT
            if (data.allItems[type].length>0){
                //getting the last element of the ID
                ID = data.allItems[type][data.allItems[type].length -1].id+1  
            }else{
                ID =0;
            }
           

        //adding an item according it type
            if (type === 'exp') {
            
                newItem = new Expense(ID, description,value)

            }else{

                newItem = new Income(ID, description,value);
                
            }
            //push it the data structure
            data.allItems[type].push(newItem);
            //return the new element 
            return newItem;
        },

        deleteItem : function(type, id){
            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id
            })

            index = ids.indexOf(id)

          //  console.log(ids,index);

            if(index !== -1){
            
                data.allItems[type].splice(index, 1)
            }


        },

        calculatePercent :function(){

            data.allItems.exp.forEach(function(curr){
                curr.calculatePercentage(data.allTotals.inc);
            })

        },

        getPercent : function(){

            var allpercent = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            })

            return allpercent;

        },

        calculateBudget : function(){

            // Calculate Total Income
                calculateTotal('inc');
                calculateTotal('exp');

            // Calculate Budget  : income - expense
                data.budget = data.allTotals.inc - data.allTotals.exp

            // Calculate percentage of income that we spent
                if(data.allTotals.inc > 0){

                    data.percentage = Math.round(((data.allTotals.exp / data.allTotals.inc) * 100));

                }else{
                    data.percentage = -1;
                }

        },

        getBudget : function(){
            return{
                budget : data.budget,
                percentage : data.percentage,
                totalInc : data.allTotals.inc,
                totalExp : data.allTotals.exp
            }
        },

        
        testing : function(){
            return console.log(data); 
        }


   }

    })()
    
    var  UIController = (function () {

        var DOMstrings = {

            type : '.add__type',
            description : '.add__description',
            value : '.add__value',
            button : '.add__btn',
            incomeContainer : '.income__list',
            expenseContainer : '.expenses__list',
            budgetLabel : '.budget__value',
            budgetIncomeLabel : '.budget__income--value',
            budgetExpenseLabel : '.budget__expenses--value',
            budgetPercentageLabel : '.budget__expenses--percentage',
            container : '.container',
            expensePercentageLabel : '.item__percentage',
            monthLabel : '.budget__title--month'
    
        }

        var formatNumbers = function(num, type){

            var numsplit, int, dec;

            num = Math.abs(num);
            num = num.toFixed(2);
            numsplit = num.split('.');

            int = numsplit[0];
            dec = numsplit[1];

            if(int.length > 3){
               int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3)
            //   console.log(int)
            }

            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec

        }

        var nodeListforEach = function(list, callback){
                        
            for(var i = 0; i<list.length; i++){
                   
                    callback(list[i], i)

                }
            }

        
        return{
                 getinput: function(){

                            return{
                            type : document.querySelector(DOMstrings.type).value,   //Will be inc or exp
                            description : document.querySelector(DOMstrings.description).value,
                            value : parseFloat(document.querySelector(DOMstrings.value).value)
                            }
            
                 }, 
                
                getDOMstrings : function(){

                    return DOMstrings;
                },

                addListItem : function(obj,type){
                
                var html, newHtml, element;

                if (type === 'inc') {

                    element = DOMstrings.incomeContainer;
                    html = '<div class="item clearfix" id=inc-%id%><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%ItemValue%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

                }else if (type === 'exp') {
                    
                    element = DOMstrings.expenseContainer;
                    html = '<div class="item clearfix" id=exp-%id%><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%ItemValue%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                }

                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%ItemValue%', formatNumbers(obj.value, type));
                
                document.querySelector(element).insertAdjacentHTML('beforebegin', newHtml);

                },

                deleteListItem : function(selectorID){

                    var el = document.getElementById(selectorID);
                    //console.log(selectorID)
                    el.parentNode.removeChild(el)

                },

                clearField : function(){
                
                var field, fieldArr;
                field = document.querySelectorAll(DOMstrings.description + ',' + DOMstrings.value); //returns a list 

                fieldArr = Array.prototype.slice.call(field) //using slice function it will return an  array so we can perform loop operations on it

                fieldArr.forEach(function(current, index, array){
                current.value = "";
                fieldArr[0].focus();
                })
                // console.log(fieldArr)
                },

                displayBudget : function(obj){
                    var type;

                    type = obj.budget > 0 ? 'inc' : 'exp';
                
                    document.querySelector(DOMstrings.budgetLabel).textContent = formatNumbers(obj.budget, type),
                    document.querySelector(DOMstrings.budgetIncomeLabel).textContent = formatNumbers(obj.totalInc, 'inc'),
                    document.querySelector(DOMstrings.budgetExpenseLabel).textContent = formatNumbers(obj.totalExp, 'exp')

                    if(obj.percentage > 0){
                        document.querySelector(DOMstrings.budgetPercentageLabel).textContent = obj.percentage+'%'
                    }else{
                        document.querySelector(DOMstrings.budgetPercentageLabel).textContent = '---'
                    }
                    

                },

                displayMonth : function(){

                    var currentDate, monthName, month, year; 

                    currentDate= new Date();

                    year = currentDate.getFullYear();
                    month = currentDate.getMonth();

                    monthName = ['January','February','March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',  'November', 'December'];

                    document.querySelector(DOMstrings.monthLabel).textContent = monthName[month] + ' ' + year;

                },

                

                displayPercentage : function(percentage){
                    var fields;
                    
                    fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);

                    nodeListforEach(fields, function(curr, index){
                        
                        if(percentage[index] >0){
                            
                            curr.textContent = percentage[index] + ' %';

                        }else{
                            curr.textContent = '---'
                        }
                        

                    })

                },

                changeType : function(){

                    var fields = document.querySelectorAll(DOMstrings.type + ','
                                                          + DOMstrings.description + ','
                                                          + DOMstrings.value);

                    nodeListforEach(fields, function(curr){
                        curr.classList.toggle('red-focus')
                    })

                    document.querySelector(DOMstrings.button).classList.toggle('red');

                }

        }

        
    })();
    
    var controller = (function (budgetCtrl, uiCtrl) {

    var setupEventlisteners = function(){

        document.querySelector(DOM.button).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress',function(event){

                if (event.keyCode === 13 || event.which === 13) {

                    event.preventDefault();
                    event.stopPropagation();
                    ctrlAddItem();
                   // console.log(event)
                }
           
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.type).addEventListener('change', uiCtrl.changeType)

    }

        var  DOM = uiCtrl.getDOMstrings();

        var updateBudget = function(){

            // Calculate the budget.
            budgetCtrl.calculateBudget();

            // Returns Budget 
           var budget =  budgetCtrl.getBudget();

            // Display on the UI
           // console.log(budget);
            uiCtrl.displayBudget(budget)
        }


        var updatePercentages = function(){

            budgetCtrl.calculatePercent();

            var Percentage = budgetCtrl.getPercent();

           // console.log(Percentage);

            uiCtrl.displayPercentage(Percentage);

        }
    
        var ctrlAddItem = function(){

                // Get the field input data.
                var input = uiCtrl.getinput();
                //console.log(input);

                if(input.description !== "" && !isNaN(input.value) && input.value !== 0){

                // Add the item to the budget controller.

                var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                // Add item to the UI.

                uiCtrl.addListItem(newItem, input.type);

                //Clear fields

                uiCtrl.clearField();

                //Update budget and display on the UI

                updateBudget();

                //Calculate and update percentages
                updatePercentages();

                }

        }

        var ctrlDeleteItem = function (event) {
            
            var itemID, splitID, type, ID ;

           itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

           if(itemID){

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //console.log(splitID)

            // Delete the item from data structure
            budgetCtrl.deleteItem(type, ID);

            // Delete the item from UI
            uiCtrl.deleteListItem(itemID);

            // Update and show the new budget
            updateBudget();

            //Calculate and update percentages
            updatePercentages();

           }

        }

        

        return{

            init : function(){
            console.log("Application started");
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget : 0,
                percentage : -1,
                totalInc : 0,
                totalExp : 0
            })
            setupEventlisteners();
            }

        }
        
      
        
    })(budgetController,UIController);

    controller.init();
