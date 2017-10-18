local utils = require("Module:TemplateUtils")
 
local p = {}
 
local totalNumberOfCards = 1394
local totalNumberOfOtherCards = 378
 
local setNames = {}
setNames["D"]="Starter set"
setNames["ORI"]="Origins"
setNames["BFZ"]="Battle for Zendikar"
setNames["OGW"]="Oath of the Gatewatch"
setNames["SOI"]="Shadows over Innistrad"
setNames["EMN"]="Eldritch Moon"
setNames["KLD"]="Kaladesh"
setNames["AER"]="Aether Revolt"
setNames["AKH"]="Amonkhet"
 
 
function p.SingleCard(name)
 
	local cards = utils.RecreateTable(mw.loadData("Module:Data/Cards"))
	for i = 1, totalNumberOfCards do
    	if cards[i].Name == name then return cards[i] end
	end
end
 
local function PT(card)
    if ((card.Power == nil) or (card.Toughness == nil)) then
        if card.Loyalty ~= nil then
            return "("..card.Loyalty..")"
        else
            return ""
        end
    else
        return "("..card.Power.."/"..card.Toughness..")"
    end
end
 
local function ExpansionSymbol(card)
    return "{{"..card.SetCode..card.Rarity:sub(1,1).."}}"
end
 
local function TableContains(t,item)
    if(not t) or (not item) then return false end
    for _,v in pairs(t) do
        if v == item then
            return true
        end
    end
    return false
end
 
local function splitString(inputstr, sep)
        if sep == nil then
                sep = "$"
        end
        local t={} ; i=1
        for str in string.gmatch(inputstr, "([^"..sep.."]+)") do
                t[i] = str
                i = i + 1
        end
        return t
end
 
 
local function ConcatTables(target,source)
    if not source then return end
    for _,v in pairs(source) do
        table.insert(target,v)   
    end
end
 
function p.GetCardCategories(card)
    local categories = {}
    table.insert(categories,"Cards")
    table.insert(categories,setNames[card.SetCode])
    ConcatTables(categories,card.Colors)
    table.insert(categories,card.Rarity)
    ConcatTables(categories,card.SuperTypes)
    ConcatTables(categories,card.Types)
    ConcatTables(categories,card.SubTypes)
    if card.Watermark then table.insert(categories,card.Watermark) end
 
    local s = ""
    for _,v in pairs(categories) do
         s = s .. "[[Category:"..v.."]]"
    end
 
    return s
end
 
local Land = {}
local Creature = {}
local Artifact = {}
local Enchantment = {}
local Instant = {}
local Sorcery = {}
local Planeswalker = {}
local errors = {}
 
local decklistTemplate = [=[<center><big><big><big>%s</big></big></big></center><br/>
{{Div col}}
%s{{Div col end}}]=]
 
 
local function SortListIntoTypes(list)
    for _,t in pairs(list) do
        local split = mw.text.split(t," ")
        local num, name = table.remove(split,1), table.concat(split," ")
        if tonumber(num) == nil then
            num = 0
        end
        local card = p.SingleCardNonSensitive(name)
        if card then
            if TableContains(card.Types,"Land") then
                table.insert(Land,{num,card})
            elseif TableContains(card.Types,"Creature") then
                table.insert(Creature,{num,card})
            elseif TableContains(card.Types,"Artifact") then
                table.insert(Artifact,{num,card})
            elseif TableContains(card.Types,"Enchantment") then
                table.insert(Enchantment,{num,card})
            elseif TableContains(card.Types,"Instant") then
                table.insert(Instant,{num,card})
            elseif TableContains(card.Types,"Sorcery") then
                table.insert(Sorcery,{num,card})
            elseif TableContains(card.Types,"Planeswalker") then
                table.insert(Planeswalker,{num,card})
            else
                table.insert(errors,{num,{Name=name}})
mw.log(num.." "..name)
            end
        else
            table.insert(errors,{num,{Name=name}})
mw.log(num.." "..name)
        end
    end
end
 
local function LogTypes()
    mw.log("Land : "..#Land)
    mw.log("Creature : "..#Creature)
    mw.log("Artifact : "..#Artifact)
    mw.log("Enchantment : "..#Enchantment)
    mw.log("Instant : "..#Instant)
    mw.log("Sorcery : "..#Sorcery)
    mw.log("Planeswalker : "..#Planeswalker)
    mw.log("errors : "..#errors)
end
 
function p.SingleCardNonSensitive(name)
    name = string.lower(name)
	local cards = utils.RecreateTable(mw.loadData("Module:Data/Cards"))
	for i = 1, totalNumberOfCards do
    	if string.lower(cards[i].Name) == name then
    	    local foundCard = utils.MakeTableWriteable(cards[i])
    	    foundCard.Playable = true
    	    return foundCard
    	end
	end
	local otherCards = utils.RecreateTable(mw.loadData("Module:Data/OtherCards"))
	for i = 1, totalNumberOfOtherCards do
    	if string.lower(otherCards[i].Name) == name then 
    	    local foundOtherCard = utils.MakeTableWriteable(otherCards[i]);
    	    foundOtherCard.Playable = false
    	    return foundOtherCard
    	end
	end
end
 
local buffer = ""
 
local function Write(s)
    buffer = buffer..s
end
 
local function WriteLine(s)
    buffer = buffer..s.."\n"
end
 
local function WriteCardsFromType(typeCards,typeName)
    if typeCards[1] and typeCards[1][2].cmc then
        table.sort(typeCards,function(a,b) return (a[2].cmc < b[2].cmc) or ((a[2].cmc == b[2].cmc) and (a[2].Name < b[2].Name)) end)
    end
    local numType = 0
    for i = 1, #typeCards do
        numType = numType + typeCards[i][1]
    end
    if #typeCards > 0 then
        WriteLine("<big><big>"..numType.." "..typeName.."</big></big><br/>")
        for i = 1, #typeCards do
            if (typeCards[i][2].Playable) then
                WriteLine(typeCards[i][1].." {{Card|"..typeCards[i][2].Name.."}}<br/>")
            else
                WriteLine(typeCards[i][1].." {{CardTooltip|"..typeCards[i][2].Name.."}}<br/>")
            end
        end
    end
end
 
local function WriteOtherCards(typeCards)
    local numType = 0
    for i = 1, #typeCards do
        numType = numType + typeCards[i][1]
    end
    if #typeCards > 0 then
        WriteLine("<big><big>"..numType.." Others</big></big><br/>")
        for i = 1, #typeCards do
            WriteLine(typeCards[i][1].." {{CardTooltip|"..typeCards[i][2].Name.."}}<br/>")
        end
    end
end
 
local function WriteTypeLists()
 
    WriteCardsFromType(Land,"Lands [[File:Icon land.png|23px|link=]]")
    WriteCardsFromType(Creature,"Creatures [[File:Icon creature.png|23px|link=]]")
    WriteCardsFromType(Artifact,"Artifacts [[File:Icon artifact.png|23px|link=]]")
    WriteCardsFromType(Enchantment,"Enchantments [[File:Icon enchantment.png|23px|link=]]")
    WriteCardsFromType(Instant,"Instants [[File:Icon instant.png|23px|link=]]")
    WriteCardsFromType(Sorcery,"Sorceries [[File:Icon sorcery.png|23px|link=]]")
    WriteCardsFromType(Planeswalker,"Planeswalkers [[File:Icon planeswalker.png|23px|link=]]")
    WriteOtherCards(errors)
end

local function WriteCardData(list)
    WriteLine("<div style='display:block;' id='chartdata'>");
    for _,t in pairs(list) do
        local split = mw.text.split(t," ")
        local num, name = table.remove(split,1), table.concat(split," ")
        if tonumber(num) == nil then
            num = 0
        end
        local card = p.SingleCardNonSensitive(name)
        if card then
            Write(num..card.Name.."|")
        end
    end
    WriteLine("")
    WriteLine("</div>")
end

 
local function GenerateDeckFromList(name,list)
 
    SortListIntoTypes(list)
    WriteTypeLists()
    WriteLine("This came from AapDeck")
    WriteCardData(list)

    return string.format(decklistTemplate,name,buffer)
end
 
 
function p.TestGenerateDeckFromList(name,inputList)
    local list = mw.text.split( inputList, "\n" )
    return (GenerateDeckFromList(name,list))
end
 
 
function p.GenerateDeckFromList(frame)
    local args = utils.RecreateTable(frame:getParent().args)
    local list = mw.text.split( args.Deck, "\n" )
 
    return frame:preprocess(GenerateDeckFromList(args.Name,list))
end
 
return p

