<template>
    <div>
        <el-table ref="multipleTable" class="normalTable" @row-click="rowClick" :data="tableData" @selection-change="handleSelectionChange" border style="width: 100%">
            <el-table-column type="selection" label="" width="50" v-if="pluginSetting.mutiSelect">
            </el-table-column>
            <el-table-column v-for="item in cols" :key="item.prop" :label="item.label" :prop="item.prop" :width="item.width" :fixed="item.isFix" :sortable="item.sortable">
                <template slot-scope="scope" >
                    <!-- 修改或新增行高亮标志 -->
                    <img :id="scope.row.id" v-show='(scope.row.id==""||typeof(scope.row.id)=="undefined"||updateIDColArray.indexOf(scope.row.id)>=0)&&item.flag' class="update-icon" src="../../../static/image/content/redremind.png"/> 
                    <!-- 复选框 -->
                    <el-checkbox v-if="item.controls=='checkbox'" :disabled="item.isDisable" v-model='scope.row[item.prop]'></el-checkbox>
                    <!-- 按钮 -->
                    <el-button v-if="item.controls=='button'" type="text" size="small"  @click="modify(scope.row)">{{scope.row[item.prop]}}</el-button>
                    <!-- 文本框 -->
                    <el-input :disabled="item.isDisable" :class="[{errorclass:item.required&&scope.row[item.prop]==''&&ifSave==true}]"   class="noEdit" v-if="item.controls=='text'" v-model="scope.row[item.prop]"></el-input>
                    <!-- 时间显示 -->
                    <el-date-picker :disabled="item.isDisable"  v-if="item.controls=='datetime'"  v-model="scope.row[item.prop]" type="date"></el-date-picker>
                    <!-- 下拉 -->
                    <el-select :disabled="item.isDisable" v-if="item.controls=='select'"  v-model="scope.row[item.prop]" class="1233" :class='classMap[scope.row[item.prop]]'  >
                        <el-option  v-for="options in item.dataSource" :key="options.itemValue" :label="options.itemName" :value="options.itemValue">
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column prop="address12" label="操作" width="" v-if='command.length>0'>
                <template slot-scope="scope">
                    <el-button v-for="item in command" :key="item.text" @click='btnClick(scope.row,scope.$index,$event);'  type="text" size="small" :class="item.class" >{{item.text}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row>
            <el-col :span='24' v-if="pluginSetting.hasPagination">
                <el-pagination style="margin-top:20px;" class="text-right" :page-size="eachPage" :page-sizes="[5, 10, 15]" :total="totalCount"  @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="currentPage" background layout="total, sizes, prev, pager, next, jumper"  :page-count="totalPagination" ></el-pagination>
            </el-col>
        </el-row>
        <dialogBox :dialogSetting='dialogSetting' :errorTips='errorTips' @dialogColse='dialogColse' :dialogVisible="dialogVisible" :dialogCommand='dialogCommand'  @dialogClick="dialogClick"></dialogBox>   
    </div>
</template>
<script type="text/javascript">
    import dialogBox from '../dialog/dialog'
	export	default{
		props:['methodsUrl','cols','tableName',"ifSave",'command',"queryParams",'pluginSetting'],
		data(){
			return{
                // currentPage:1,//当前页码
                totalPage:10,//总页数
                eachPage:10,//每页显示条数
                tableLoading:true,//加载动画
                tableClone:[],
                updateId:'',//修改行id
                rowIndex:'',//修改行index
                updateRow:'',
                options: [{
                    value: 0,
                    label: '禁用'
                    }, {
                    value: 1,
                    label: '启用'
                }],
                delIndex:'',
                delRow:'',
                dialogSetting:{
                    message:'',//提示信息
                    dialogName:'',//对话框名称
                    dialogType:'',//对话框类型
                },
                dialogCommand:[],
                dialogVisible:false,
                errorTips:{//对话框 错误提示
                    message:'',
                    details:'',
                },
                updateArray:[],
                pageFlag:true,
                turnPage:-1,
                targetPage:-1,//目标跳转页
                ParamsArray:[],
			}
        },
        created:function(){
            this.classMap=['Disabled','Enabled','Frozen'];
            this.$store.commit('setTableName',this.tableName)//传递具体数据模型名称
            this.$store.commit('setQueryApi', this.methodsUrl.query);//传递查询数据初始化api
            this.$store.commit('setTreeQueryApi', this.methodsUrl.treeQuery);//传递查询树节点数据初始化api
            this.$store.commit('setQueryParams', this.queryParams);
            this.$store.dispatch('InitTable');//初始化表格数据
            setTimeout(() => {//拷贝初始化数据，和修改行做对比
               this.InitTableClone();
            }, 1500);
        },
        components:{
            dialogBox
        },
        computed:{
            tableData(){//表格数据
                return this.$store.state[this.tableName+'Table'];   
            },
            currentPage:{
                get:function(){
                    return this.$store.state[this.tableName+'CurrentPage'];
                },
                set:function(newValue){
                   this.$store.state[this.tableName+'CurrentPage']=newValue;
                }
            },
            newColArray(){//新增数据集合
                if(!this.pluginSetting.isDisable){
                    return this.$store.state[this.tableName+'NewColArray'];
                }else{
                    return [];
                }  
            },
            updateIDColArray(){//修改row集合
                if(!this.pluginSetting.isDisable){
                    this.updateArray=[];
                    if(this.$store.state[this.tableName+'UpdateColArray'].length>0){
                        for(let i in this.$store.state[this.tableName+'UpdateColArray']){
                            this.updateArray.push(this.$store.state[this.tableName+'UpdateColArray'][i].id);
                            
                        }
                        console.log(this.updateArray);
                        return this.updateArray;
                    }else{
                        return [];
                    }
                   // return this.$store.state[this.tableName+'UpdateColArray'];                     
                }else{
                    return [];
                }               
            },
            totalPagination(){//分页总数
                return this.$store.state[this.tableName+'TotalPagination'];
            },
            totalCount(){//总条数
                return this.$store.state[this.tableName+'TotalCount'];
            },
        },
        watch:{
            // $route(to) {//页签切换,重置表格数据模型名称
            //       this.$store.commit('setTableName',to.name)
            // },
            cols:{//动态表头参数
                handler:function(val,oldVal){
                        this.cols=val;
                },
                deep:true
            },
            newColArray:{
                handler:function(val,oldVal){
                    if(val.length>0){
                        this.turnPage=Number($(document).find(".el-pagination.is-background .el-pager li.active").html());
                    }
                },
                deep:true
            },
            updateColArray:{
                handler:function(val,oldVal){
                    if(val.length>0){
                        this.turnPage=Number($(document).find(".el-pagination.is-background .el-pager li.active").html());
                    }
                },
                deep:true
            },
            ifSave(val){
                this.ifSave=val;
            },
            tableData:{
                handler: function (val, oldVal) {
                    if(oldVal.length>0&&!this.isDisable){
                        this.rowIndex="";
                        for(let i in this.$store.state[this.tableName+'Table']){
                            if(this.updateRow.id==this.$store.state[this.tableName+'Table'][i].id&&typeof(this.updateRow.id)!="undefined"){
                                this.rowIndex=i;
                            }
                        }
                        if(this.rowIndex==""){
                            return
                        }else{
                            if(!this.Compare(this.updateRow,this.$store.state[this.tableName+'Table'][this.rowIndex])){
                                this.$store.dispatch('AddUpdateArray',this.$store.state[this.tableName+'Table'][this.rowIndex]);
                                this.updateRow="";//将选取的修改行数据清空
                            }
                        }
                        
                    }
                },
                deep: true
            },
        },
        methods:{
            InitTableClone(){
                let table= this.deepClone(this.$store.state[this.tableName+'Table'])
                this.$store.commit('Init_TableClone', table);
                this.tableClone=this.$store.state[this.tableName+'TableClone'];
            },
            btnClick(row,index,event){
                if($(event.currentTarget).text()=="查看"){
                    this.modify(row);
                }else if($(event.currentTarget).text()=="删除"){
                    this.dialogOpen(row,index);
                }
            },
            modify(row){//查看编辑
                this.$store.state.url=this.methodsUrl.view+row.id
                this.$router.push({path:this.$store.state.url})//点击切换路由
            },
            dialogOpen(row,index){//单条删除
                let _this=this;
                _this.delIndex=index;
                _this.delRow=row;
                _this.dialogSetting.dialogName="delDialog";//对话框名称
                _this.dialogCommand=[{text:'确认',class:'btn-confirm'},{text:'取消',class:'btn-cancel'}]
                _this.dialogSetting.message="确定删除？";//对话框提示信息
                _this.dialogSetting.dialogType='confirm';
                _this.dialogVisible=true;//对话框可见
            },
            open(tittle,iconClass,className) {//提示框
                this.$notify({
                position: 'bottom-right',
                iconClass:iconClass,
                title: tittle,
                showClose: false,
                duration: 3000,
                customClass:className
                });
            },
            dialogClick(parmas){//对话框确认
                let _this=this;
                if(parmas.dialogButton=="确认"){
                    if(parmas.dialogName=="delDialog"){//删除确认
                        if(_this.newColArray.length>0){
                            _this.$store.state[this.tableName+'Table'].splice(this.delIndex,1);
                            _this.newColArray.splice(_this.delIndex,1);
                        }else{
                            _this.$axios.deletes(_this.methodsUrl.delete,{Id:_this.delRow.id}).then(function(res){
                                _this.$store.dispatch('InitTable');//初始化表格数据
                                _this.open('删除成功','el-icon-circle-check','successERP');  
                            }).catch(function(err){
                                _this.$message({
                                    type: 'warning',
                                    message: err.error.message
                                });
                            })  
                        }
                    }else if(parmas.dialogName=="pageDialog"){//翻页对话框
                        this.$store.commit('setCurrentPage',this.targetPage)//跳转至目标分页
                        this.queryParams.SkipCount=(this.targetPage-1)*this.$store.state[this.tableName+'EachPage'];
                        this.queryParams.MaxResultCount=this.$store.state[this.tableName+'EachPage'];
                        this.$store.commit('setQueryParams', this.queryParams);//重置查询参数
                        this.$store.dispatch('InitTable')
                        setTimeout(() => {//拷贝初始化数据，和修改行做对比
                            this.InitTableClone();
                        }, 1000);
                        this.$store.commit('setUpdateColArray',[])//置空修改增集合 
                        this.$store.commit('setAddColArray',[])//置空修改增集合 
                        this.$store.commit('get_RowId',"")//置空修改行id
                        //this.$store.commit('setIfDel',true);//设置删除参数为真
                    }
                }else if(parmas.dialogButton=="取消"){
                    if(parmas.dialogName=="pageDialog"){
                        this.pageFlag=false;
                        this.$store.commit('setCurrentPage',this.turnPage)   
                    }
                }
                this.dialogVisible=false;              
            },
            rowClick(row){//获取行id
                for(let i in this.tableClone){
                    if(row.id==this.tableClone[i].id){
                       this.updateRow=this.tableClone[i];
                    }
                }
            },
            handleSelectionChange(val){//多选操作
                this.$store.commit('setTableSelection',val);
            },
            handleCurrentChange:function(val){//获取当前页码,分页
                let _this=this;
                if((this.newColArray.length>0||this.updateArray.length>0)&&this.pageFlag){
                    _this.targetPage=val;
                    _this.dialogSetting.dialogName="pageDialog"//对话框名称
                    _this.dialogSetting.message="当前存在未保存修改项，是否继续翻页?";//对话框提示信息
                    _this.dialogSetting.dialogType='confirm',
                    _this.dialogCommand=[{text:'确认',class:'btn-confirm'},{text:'取消',class:'btn-confirm'}]
                    _this.dialogVisible=true;//对话框是否显示
                }else if(this.newColArray.length==0&&this.updateArray.length==0){
                    this.$store.commit('setCurrentPage',val)//跳转至目标分页
                    this.queryParams.SkipCount=(val-1)*this.$store.state[this.tableName+'EachPage'];
                    this.queryParams.MaxResultCount=this.$store.state[this.tableName+'EachPage'];
                    this.$store.commit('setQueryParams', this.queryParams);//重置查询参数
                    this.$store.dispatch('InitTable');
                    setTimeout(() => {//拷贝初始化数据，和修改行做对比
                        this.InitTableClone();
                    }, 1500);
                    this.$store.commit('setUpdateColArray',[])//置空修改增集合 
                    this.$store.commit('setAddColArray',[])//置空修改增集合 
                    this.$store.commit('get_RowId',"")//置空修改行id
                }
                setTimeout(() => {this.pageFlag = true}, 1000)   
            },
            handleSizeChange(val){//每页显示条数变化
                this.$store.commit('setEachPage',val)//重置分页显示条数
                this.queryParams.SkipCount=(this.$store.state[this.tableName+'CurrentPage']-1)*val;
                this.queryParams.MaxResultCount=val;
                this.$store.commit('setQueryParams', this.queryParams);
                this.$store.dispatch('InitTable');//初始化表格数据
            },
            dialogColse(){//对话框关闭回调事件
                this.dialogVisible=false;
            },
            // 数据深拷贝
            // 递归实现一个深拷贝
            deepClone(source){
                if(!source || typeof source !== 'object'){
                    throw new Error('error arguments', 'shallowClone');
                }
                var targetObj = source.constructor === Array ? [] : {};
                for(var keys in source){
                    if(source.hasOwnProperty(keys)){
                        if(source[keys] && typeof source[keys] === 'object'){
                        targetObj[keys] = source[keys].constructor === Array ? [] : {};
                        targetObj[keys] = this.deepClone(source[keys]);
                        }else{
                        targetObj[keys] = source[keys];
                        }
                    } 
                }
                return targetObj;
            },
            isObj(object) {  
                return object && typeof (object) == 'object' && Object.prototype.toString.call(object).toLowerCase() == "[object object]";  
            },        
            isArray(object) {  
                return object && typeof (object) == 'object' && object.constructor == Array;  
            }, 
            getLength(object) {  
                var count = 0;  
                for (var i in object) count++;  
                return count;  
            },
            Compare(objA, objB) {  
                if (!this.isObj(objA) || !this.isObj(objB)) return false; //判断类型是否正确  
                if (this.getLength(objA) != this.getLength(objB)) return false; //判断长度是否一致  
                return this.CompareObj(objA, objB, true);//默认为true  
            },  
            CompareObj(objA, objB, flag) {  
                for (var key in objA) {  
                    if (!flag) //跳出整个循环  
                        break;  
                    if (!objB.hasOwnProperty(key)) { flag = false; break; }  
                    if (!this.isArray(objA[key])) { //子级不是数组时,比较属性值  
                        if (objB[key] != objA[key]) { flag = false; break; }  
                    } else {  
                        if (!this.isArray(objB[key])) { flag = false; break; }  
                        var oA = objA[key], oB = objB[key];  
                        if (oA.length != oB.length) { flag = false; break; }  
                        for (var k in oA) {  
                            if (!flag) //这里跳出循环是为了不让递归继续  
                                break;  
                            flag = this.CompareObj(oA[k], oB[k], flag);  
                        }  
                    }  
                }  
                return flag;  
            }, 
        }
	}
</script>
<style >
.noEdit .el-input__inner {
    border: none;
    height: 28px;
    text-align: center;
}
.noEdit.is-disabled .el-input__inner{
    color: #606266;
    background: #fff;
}
.update-icon{
    width:14px;
    height: 14px;
    position: absolute;
    left: -55px;
    top: 0px;
}
.normalTable .el-select input.el-input__inner[disabled] {
    background: #fff;
    height: 28px;
    border: 0;
    text-align: center;
}
/* 重写el-table样式 */
.group-management-wrapper .el-table th {
    white-space: nowrap;
    overflow: hidden;
    user-select: none;
    text-align: left;
    padding: 5px 0;
    text-align: center;
    background-color: #ececec;
}
.group-management-wrapper .el-table td{
    padding: 3px 0;
}
.group-management-wrapper .el-table__body{
    text-align: center;
}
/* 日期控件 */
table .el-date-editor.el-input{
    width:100%;
}
table .el-input--prefix .el-input__inner{
    border:none;
    background-color:transparent;
    padding-left:0;
    padding-right:0;
}
table .el-input__icon{
    display:none;
}
/* 表格内编辑下拉框样式重构 */
table .el-input__inner{
    height: 28px;
    text-align:center;
    border:none;
}
/* 验证为空 */
.errorclass{
    border:1px solid #f98b8b!important;
}
/* hover行高亮 */
.normalTable .el-table__body tr.hover-row>td,
.normalTable .el-table__body tr.hover-row>td input,
.normalTable .el-table__body tr.hover-row>td input[disabled],
.normalTable.el-table--enable-row-hover .el-table__body tr:hover>td, 
.normalTable.el-table--enable-row-hover .el-table__body tr:hover>td input, 
.normalTable.el-table__body tr:hover>td input[disabled]{
    background: #d1ddf1!important;
}
/* 得到焦点背景为白色 */
.normalTable .el-table__body tr>td input:focus,
.normalTable.el-table--enable-row-hover .el-table__body tr>td input:focus{
    background: #fff!important;
}
/* 清空动画 */
.normalTable.el-table--enable-row-transition .el-table__body td{
    transition:background-color 0s ease!important;
    -webkit-transition: background-color 0s ease!important;
}
/* 重置禁用input样式 */
.normalTable .el-input.is-disabled .el-input__inner{
    color: #606266;
    background-color: #fff;
    border-color: #e4e7ed;
}
/* 状态颜色定义 */
.Disabled .el-input--suffix .el-input__inner{
    color: #FF6666!important;
}
.Enabled .el-input--suffix .el-input__inner{
    color: #33CC66!important;
}
.Frozen .el-input--suffix .el-input__inner{
    color: #FF6600!important;
}
</style>