<template functional>
    <div
        id="dbz-map-tooltip"
        ref="tooltip"
        :class="[
            'dbz-map__tooltip',
            props.tooltipClasses
        ]"
    >
        <span
            id="dbz-map-tooltip-text"
            ref="tooltipText"
            :class="[
                'dbz-map__tooltip-text',
                props.tooltipTextClasses
            ]"
            v-text="props.label || 'Finding your location...'"
        />
        <span id="dbz-map-pin" class="dbz-map__tooltip-pin" />
    </div>
</template>

<script>
    export default {

    };
</script>

<style scoped lang="scss">
.dbz-map {
    @media (min-width: 35.5em){
        &__canvas-wrapper{
            position:fixed;
            top:0;
            left:0;
            z-index:100;
            border-bottom:1px solid #a8a8a8;
        }
    }

    &__canvas{
        position:relative;
        width:100%;
        height:200px;
        background:url(/images/paa/dummy_map_2.jpg) center center no-repeat;
        border-radius:8px;
    }

    &__tooltip{
        position: absolute;
        top: 40px;
        left: 50%;
        // width: 8px;
        // height: 8px;
        // border: 8px solid #ffffff;
        // border-radius: 50%;

        // &.dragging,
        // &.hidden{
        //     opacity:0;
        // }

        // &::after {
        //     position: absolute;
        //     bottom: -30px;
        //     left: -6px;
        //     width: 0;
        //     height: 0;
        //     content: '';
        //     border: 10px solid transparent;
        //     border-top: 17px solid #ffffff;
        // }
    }

    &__tooltip-text{
        font-size:14px !important;
        font-weight:700;
        color:#2153b0;
        text-align:left;
        text-shadow:-1px -1px 0 rgba(255,255,255,.5),0 -1px 0 rgba(255,255,255,.5),1px -1px 0 rgba(255,255,255,.5),1px 0 0 rgba(255,255,255,.5),1px 1px 0 rgba(255,255,255,.5),0 1px 0 rgba(255,255,255,.5),-1px 1px 0 rgba(255,255,255,.5),-1px 0 0 rgba(255,255,255,.5);
        white-space:nowrap;
        transition-duration:.2s;
        transition-property:all;
        -webkit-font-smoothing:antialiased;
        font-smoothing:antialiased;
    }

    // &__tooltip-pin{
    //     position:relative;
    //     box-sizing: border-box;
    //     display:block;
    //     width:24px;
    //     height:24px;
    //     text-align:center;
    //     border:8px solid #e00000;
    //     border-radius:50%;
    //     animation:bounce both 1s;

    //     &::after{
    //         position:absolute;
    //         bottom:-30px;
    //         left:-6px;
    //         width:0;
    //         height:0;
    //         content:'';
    //         border:10px solid transparent;
    //         border-top:17px solid #e00000;
    //     }
    // }

    &__heading{
        margin:1.875em 0;
        font-size:1.625em;
        font-weight:400;
        line-height:1.38462em;
    }
}

@keyframes attention-seeker{
    0%,
    100%{
        background-color:#ffffff;
    }

    50%{
        background-color:rgba(0,162,100,.4);
    }
}

@keyframes anim-spin{
    0%{
        transform:rotate(0);
    }

    100%{
        transform:rotate(360deg);
    }
}

.anim-spin{
    color:#a8a8a8 !important;
    transition-duration:color;
    transition-property:all;
    animation:anim-spin 1s infinite alternate ease-in-out both;
}

.dbz-animate-fade-in{
    animation:fade-in .3s both ease;
}

.dbz-animate-shake{
    animation:shake .5s both;
}

@keyframes shake{
    0%,
    100%{
        transform:translateX(0);
    }

    10%,
    30%,
    50%,
    70%,
    90%{
        transform:translateX(-10px);
    }

    20%,
    40%,
    60%,
    80%{
        transform:translateX(10px);
    }
}

@keyframes fade-in{
    from{
        opacity:0;
    }

    to{
        opacity:1;
    }
}

@keyframes bounce{
    0%{
        opacity:0;
        transform:translateY(-2000px);
    }

    60%{
        opacity:1;
        transform:translateY(30px);
    }

    80%{
        transform:translateY(-10px);
    }

    100%{
        transform:translateY(0);
    }
}

</style>
