<template functional>
    <div
        id="dmc-map-tooltip"
        ref="tooltip"
        :class="[
            'dmc-map__tooltip b-tooltip is-light is-top is-large is-always',
            props.tooltipClasses
        ]"
    >
        <div
            :class="[
                'dmc-map__tooltip-content tooltip-content',
                props.tooltipTextClasses
            ]"
        >
            <template v-if="props.label">
                <span class="dmc-map__tooltip-text" v-text="props.label" />
            </template>
            <template v-else>
                <img
                    svg-inline
                    class="dmc-map__tooltip-loader"
                    src="../assets/loader.svg"
                    width="20"
                >
                <span
                    ref="tooltipText"
                    class="dmc-map__tooltip-text"
                    v-text="'Finding your location...'"
                />
            </template>
        </div>
        <span id="dmc-map-pin" class="dmc-map__pin" />
    </div>
</template>

<script>
    export default {

    };
</script>

<style scoped lang="scss">
.dmc-map {
    strong {
        display: inline-block;
        margin-right: 5px;
        font-style: italic;
        color: #ca2128;
    }

    // TODO: add animation
    &.animate-shake {
        animation: shake .5s both;
    }

    &__tooltip {
        position: absolute;
        top: calc(50% + 7px) !important;
        left: 50% !important;
        -js-display: flex;
        display: -ms-flexbox;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 50px;
        text-align: center;
        pointer-events: none;
        user-select: none;
        opacity: 1;
        transition: opacity .3s ease-in-out;
        transform: translate(-50%, -53px);
        flex-pack: center;
        flex-align: center;

        &.dragging,
        &.hidden {
            opacity: 0;
        }
    }

    &__tooltip-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    &__tooltip-text {
        font-size: 14px !important;
        font-weight: 700;
        color: #18a57e;
        text-align: left;
        text-shadow: -1px -1px 0 rgba(255, 255, 255, 0.5), 0 -1px 0 rgba(255, 255, 255, 0.5), 1px -1px 0 rgba(255, 255, 255, 0.5), 1px 0 0 rgba(255, 255, 255, 0.5), 1px 1px 0 rgba(255, 255, 255, 0.5), 0 1px 0 rgba(255, 255, 255, 0.5), (-1px) 1px 0 rgba(255, 255, 255, 0.5), (-1px) 0 0 rgba(255, 255, 255, 0.5);
        white-space: nowrap;
        transition-duration: .2s;
        transition-property: all;
        -moz-osx-font-smoothing: grayscale;
        font-smoothing: antialiased;
    }

    &__tooltip-loader {
        margin-right: 5px;
    }

    &__pin {
        position: relative;
        display: block;
        width: 24px;
        height: 24px;
        text-align: center;
        border: 8px solid #18a57e;
        border-radius: 50%;
        box-shadow: inset 20px 20px 60px #d9d9d9, inset -20px -20px 60px #ffffff;
        // animation: bounce both 1s;

        &::after {
            position: absolute;
            bottom: -30px;
            left: -6px;
            width: 0;
            height: 0;
            content: '';
            border: 10px solid transparent;
            border-top: 17px solid #18a57e;
        }
    }

    &__heading {
        margin: 1.875em 0;
        font-size: 1.625em;
        font-weight: 400;
        line-height: 1.38462em;
    }

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
