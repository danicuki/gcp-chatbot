Type = require './type'
Move = require './move'
Pokemon = require './pokemon'
Log = require './log'
DamageCalculator = require './damageCalculator'

class Battle
  constructor: (@trainer1, @trainer2) ->
    @damageCalculator = new DamageCalculator

    @trainer1.firstPokemon()
    @trainer2.firstPokemon()

    for pokemon in @trainer1.team
      pokemon.subscribeToFaint(this)
  
    for pokemon in @trainer2.team
      pokemon.subscribeToFaint(this)

  start: ->
    @log = new Log
    @winner = null
    until @winner?
      this.nextTurn()
    
    loser = if @winner == @trainer1 then @trainer2 else @trainer1
    @log.message @winner.mainPokemon + " defeated " + loser.mainPokemon + "!"
    for pokemon in @winner.team
      @log.message pokemon.name + ": " + pokemon.hp + " HP left."

    return @log
  
  nextTurn: ->
    pokemon1 = @trainer1.mainPokemon
    pokemon2 = @trainer2.mainPokemon

    # Choose moves
    pokemon1.chooseMove pokemon2
    pokemon2.chooseMove pokemon1
    throw new Error("One of the pokemon doesn't have an attack move.") unless pokemon1.move? and pokemon2.move?
    
    # Switch out pokemon?
    newPokemon1 = pokemon1.trainer.maybeSwitchOut pokemon1, pokemon2, @log
    newPokemon2 = pokemon2.trainer.maybeSwitchOut pokemon2, pokemon1, @log
    pokemon1 = newPokemon1
    pokemon2 = newPokemon2

    # Decide who goes first
    unless pokemon1.move? and pokemon2.move?
      pkmn1GoesFirst = true
    else if pokemon1.move.priority == pokemon2.move.priority
      pkmn1GoesFirst = pokemon1.speed() > pokemon2.speed() or (pokemon1.speed() == pokemon2.speed() and Math.random() < 0.5)
    else
      pkmn1GoesFirst = pokemon1.move.priority > pokemon2.move.priority

    if (pkmn1GoesFirst)
      attacker = pokemon1
      defender = pokemon2
    else
      attacker = pokemon2
      defender = pokemon1
    
    # Perform the attacks
    this.doAttack attacker, defender if attacker.move?
    
    attacker = attacker.trainer.mainPokemon # Moves like U-turn can force a switch
    defender = defender.trainer.mainPokemon # Defending pokemon could have fainted
    
    this.doAttack defender, attacker if defender.move? and not @winner

    attacker.endTurn(@log) if attacker.isAlive() and not @winner
    defender.endTurn(@log) if defender.isAlive() and not @winner

    @log.endTurn()
  
  doAttack: (attacker, defender) ->
    if attacker.canAttack @log
      @log.message attacker.trainerAndName() + " used " + attacker.move.name + "!"
      effectiveness = attacker.move.effectiveness attacker, defender
      miss = false

      if effectiveness == 0
        @log.message "It doesn't affect " + defender.trainerAndName() + "..."
        miss = true

      else
        if Math.random() * 100 > attacker.move.accuracy
          @log.message attacker.trainerAndName() + "'s attack missed!"
          miss = true
        
        else
          hits = attacker.move.hits()
          hit = 0
          miss = false
          
          @stopMultiHit = false
          until (hit++ == hits) or @stopMultiHit
            critical = Math.random() < this.criticalChance attacker.move.criticalRateStage()
            random = Math.random() * (1 - 0.85) + 0.85

            damage = @damageCalculator.calculate attacker.move, attacker, defender, critical, random
            defender.takeDamage damage, "%(pokemon) was hit for %(damage)", @log
            
            attacker.move.afterDamage attacker, defender, damage, @log
            
      if miss
        attacker.move.afterMiss attacker, defender, @log
    
    @log.endAttack()
  
  notifyFaint: (pokemon) ->
    @log.message pokemon.trainerAndName() + " fainted!"
    @stopMultiHit = true

    otherTrainer = if pokemon.trainer == @trainer1 then @trainer2 else @trainer1
    if pokemon.trainer.ablePokemon().length == 0
      @winner = otherTrainer unless @winner

    pokemon.trainer.switchPokemon otherTrainer.mainPokemon, @log unless @winner
  
  criticalChance: (stage) ->
    switch stage
      when 0 then 1/16
      when 1 then 1/8
      when 2 then 1/2
      else 1
  

module.exports = Battle
