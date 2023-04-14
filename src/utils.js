import * as d3 from 'd3'
import _ from 'lodash'

const colorScales = {
  h: d3.scaleOrdinal().range([ '#FF00FF  ', '#008080  ','#800080 ', '#00FF00  ', '#FFA500 ', '#0000FF  ','#FF0000 ', '#008000  ', '#800000  ']),
  g: d3.scaleOrdinal().range(['#4ebf41', '#2ba81d', '#1d6915', '#29e815']  ),
  f: d3.scaleOrdinal().range(['#e60b29', '#bd6c79', '#80123e', '#872934'])
}

export const years = _.range(2003, 2023)

export function nameColor (d) {
  return colorScales[d.sex](d.name)
}

export const fullRange = d3.extent(years)

export const defaultDuration = 750

export function maxBirthsCount (names, range) {
  return _(names)
    .flatMap(d =>
      _(d.births)
        .filter(({ year }) => year >= range.from && year <= range.to)
        .map('births')
        .max()
    )
    .max() || 0
}

export const initialRange = { from: years[0], to: _.last(years) + 1 }
