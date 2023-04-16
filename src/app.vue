<template lang="pug">
#app
  content
    .left-side
      .title
        h3 Data Visualisation Coursework:
        h2 How has the usage and prominence of social media platforms changed over time in terms of their impact on various age groups?
        <body style="text-align:center">
          <h5 style="color:Blue;padding:0%;margin-bottom:0px;">All Users</h5>
          <h5 style="color:Tomato;margin-top:0px;margin-bottom:0px;">Age 20+</h5>
          <h5 style="color:Green;margin-top:0px;">Age 19 below</h5>
        </body>
      .names-list-container
        ul.names-list(ref="namesList")
          li(v-for="nameData in displayedNames",
            :class="[nameData.sex, nameData.selected ? 'selected' : '']",
            :style="nameStyle(nameData)",
            :title="nameData.alternateNames ? '' + nameData.alternateNames.join(', ') : null",
            v-text="nameData.name"
            @click.prevent="toggleName(nameData)"
          )
    .right-side
      graph(
        :names="selectedNames",
        @name:remove="toggleName",
        @year-range="setYearRange"
      )
      .bottom
        .block
          .share-url
            div The d3 visualisation above contains information on the percentage of individuals using various social media platforms across different age groups from 2004 to 2021. To better understand the trends in social media use over time, a line graph was plotted for each platform, with each line representing a different age group. For example, the Facebook graph contains three lines: one for all age groups, one for individuals aged 16-19, and one for individuals aged 20+. Looking at the graph, we can see that the percentage of individuals using social media platforms has increased significantly over the years. Facebook, for example, had only 1% of individuals using it in 2004, but this number grew to 2800% in 2021. However, the rate of growth varied across different age groups. For instance, the percentage of individuals aged 16-19 using Facebook remained relatively constant at around 45% until 2014, after which it began to decline gradually. In contrast, the percentage of individuals aged 20+ using Facebook grew rapidly until 2012, and then slowed down but continued to increase. The data also reveals interesting trends across different social media platforms. For instance, Instagram and TikTok are more popular among younger age groups, with the percentage of individuals aged 16-19 using these platforms increasing rapidly over the years. In contrast, platforms like Twitter and LinkedIn have remained relatively popular among older age groups. Additionally, the d3 visualisation includes a box that displays the descending ranking of the selected social media platforms based on their overall usage percentage in 2021. According to the data, Facebook is the most popular social media platform with a usage percentage of 63.9%, followed by YouTube with 53.5% and WhatsApp with 43.1%. Instagram and Facebook Messenger round out the top five with usage percentages of 40.3% and 35.3%, respectively. This ranking can be useful for businesses and advertisers who want to focus their social media marketing efforts on the most widely used platforms. In conclusion, the line graph provides a visual representation of how social media use has evolved over the years and across different age groups. It is clear that social media platforms have become an increasingly important part of people's lives, with more and more individuals using them to connect with others, consume content, and engage in various activities. The differences in usage patterns across different age groups and platforms provide valuable insights for marketers, social media companies, and researchers looking to understand the changing landscape of social media.
        
</template>

<script>
import { nameColor, initialRange, maxBirthsCount, years } from './utils'
import * as d3 from 'd3'
import _ from 'lodash'
import graph from './graph.vue'

export default {
  name: 'App',

  components: { graph },

  data () {
    return {
      names: [],
      shareUrl: window.location.toString(),
      searchQuery: '',
      range: initialRange
    }
  },

  computed: {
    selectedNames () {
      return _.filter(this.names, 'selected')
    },

    displayedNames () {
      if (this.searchQuery === '') return this.names

      const sanitize = s => _.deburr(s).toLowerCase()
      const q = sanitize(this.searchQuery)

      return this.names.filter(({ name, alternateNames = [] }) =>
        _([name, ...alternateNames])
          .map(sanitize)
          .some(name => name.includes(q))
      )
    }
  },

  watch: {
    names: 'refreshYearRange',
    selectedNames (names) {
      window.location.hash = names.map(d => d.id + '-' + d.sex).join(',')
      this.shareUrl = window.location.toString()
    }
  },

  mounted () {
    const selectedIds = _.flatMap(window.location.hash.slice(1).split(','), id => /-[hf]$/.test(id) ? [id] : [id + '-f', id + '-h'])

    d3.json('data.json', (err, names) => {
      if (err) return window.alert(err)

      _.each(names, nameData => {
        nameData.selected = _.includes(selectedIds, nameData.id + '-' + (nameData.sex === 'm' ? 'h' : 'f'))
        nameData.style = {}
        nameData.births = _.map(years, (year, i) => ({ year, births: nameData.births[i] }))
      })

      this.names = names
      this.$nextTick(window.onresize)
    })
  },

  methods: {
    toggleName (nameData) {
      nameData.selected = !nameData.selected
    },

    setYearRange (range) {
      this.range = range
      this.refreshYearRange()
    },

    refreshYearRange () {
      const overvallMax = maxBirthsCount(this.names, this.range)

      const fontSizeScale = d3
        .scalePow()
        .exponent(0.8)
        .domain([0, overvallMax])
        .range([16, 40])

      _(this.names)
        .each(nameData => {
          // const [fontSize, lineHeight] = sizes[level]
          const fontSize = fontSizeScale(maxBirthsCount([nameData], this.range)) + 'px'
          nameData.style = { fontSize }
        })
    },

    nameStyle (nameData) {
      const backgroundColor = nameData.selected ? nameColor(nameData) : ''
      return _.assign({ backgroundColor }, nameData.style)
    },

    // selectUrl () {
    //   // http://stackoverflow.com/a/1173319
    //   const el = this.$refs['share-url']
    //
    //   if (document.selection) {
    //     var range = document.body.createTextRange()
    //     range.moveToElementText(el)
    //     range.select()
    //   } else if (window.getSelection) {
    //     const range = document.createRange()
    //     range.selectNode(el)
    //     window.getSelection().addRange(range)
    //   }
    // }
    selectUrl () {
      this.$refs['share-url'].select()
    }
  }
}
</script>
<style lang="stylus">
@import "./css/colors"

html
  height 100%
  margin 0
  padding 0

a:visited
  color: #6e4cb9

body
  font-family "HelveticaLTStd-Roman", sans-serif
  font-size 18px
  //width $width - 17px*2
  color color1
  background-color #fff

body, #app, content
  height 100%

content
  display: flex
  flex-direction: row
  padding-left: 19px

.title
  margin-bottom: 10px
  margin-top: 10px
  h1
    color: #b51f24
    font-family: "HelveticaLTStd-Bold"
    font-size: 35px
  h2
    color: #e60b29   
    border-bottom: 3px solid #000;
    border-top: 2px solid #000;
    font-size: 20px
    margin-bottom: -4px
  h1, h2
    margin: 20

.left-side
  max-width 500px
  min-width 300px
  width 33%
  display: flex
  flex-direction: column
  margin-bottom: 10px

.right-side
  flex: 1

form.search
  position: relative
  height: 32px
  > *
    position: absolute

  .search-image
    left: 4px
    top: 6px

  .clear
    top: 6px
    right: 0

  input
    color: #333
    font-family: "HelveticaLTStd-Roman"
    font-size: 19px
    padding-left 26px
    padding-top 4px
    width: calc(100% - 30px)
  a
    color: red
    font-family: sans-serif
    right: 0
    text-decoration: none


ul.names-list
  list-style none
  padding 5
  margin 0
  display: flex
  flex-wrap: wrap
  justify-content: space-between
  li
    cursor pointer
    padding 5px
    line-height 0.9
    display: inline-flex
    align-items: center
    &.h
      color blue
    &.f
      color orange
    &.g
      color green
    &.selected
      line-height 1
      color white

.share-url
  cursor: crosshair

.bottom
  margin-bottom: 20px
  padding: 20px 95px 0 50px
  font-size: 12px
  color: color-male

  input[type=text]
    color: #333333
    width: 250px

  .block
    display flex
    justify-content: space-between
  a
    text-decoration: none
  .social-links > *
    margin-left 10px
  .social
    float: left
    margin-top: -9px
    width: 117px
    > *
      display: block
  .logo
    margin-top: -8px
    margin-left: -5px
    float: left
  .explanations
    margin-top: 1em
</style>
