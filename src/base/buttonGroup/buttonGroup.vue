<template>
	<div>
    <el-row class="h48 pt5">
    		<div  style="float:left" v-for="item in buttonGroup"  :key='item.text'>
    			<button  :disabled="item.disabled" class="erp_bt" :class="item.class"  @click="btnClick(item)" >
                    <i class="iconfont" :class="item.icon"></i>
                    <span>{{item.text}}</span>
                </button>
    		</div>                   
    </el-row>
    </div>
</template>
<script type="text/javascript">
	export default{
		props: ['buttonGroup'], 
		data(){
			return{
			}
		},
		created() {
	      
	    },
	    methods:{
	    	btnClick(item){
	    		 this.$emit('btnClick',item.text);
	    	},
	    }
	}
</script>
<style>
@import"//at.alicdn.com/t/font_561828_hst83cs3ujuivn29.css";
button.erp_bt[disabled] {
    cursor: not-allowed;
    background: #ccc;
}
</style>