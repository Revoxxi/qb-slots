-- This resource was made by plesalex100#7387
-- Please respect it, don't repost it without my permission
-- This Resource started from: https://codepen.io/AdrianSandu/pen/MyBQYz
-- ESX Version: saNhje & wUNDER
-- Rewritten from ESX to QB: Revoxxi
local QBCore = exports['qb-core']:GetCoreObject()

RegisterServerEvent("qb-slots:BetsAndMoney")
AddEventHandler("qb-slots:BetsAndMoney", function(bets)
    local src   = source
	local Player = QBCore.Functions.GetPlayer(source)
	local PlayerData = Player.PlayerData
    if PlayerData then
        if bets % 50 == 0 and bets >= 50 then
            if PlayerData.money['cash'] >= bets then
                Player.Functions.RemoveMoney('cash', bets)
                TriggerClientEvent("qb-slots:UpdateSlots", src, bets)
            else
                TriggerClientEvent('QBCore:Notify', src, "You do not have enough money.", "error")
            end
        else
			TriggerClientEvent('QBCore:Notify', src, "You have to insert a multiple of 50. ex: 100, 350, 2500.", "error")
        end

    end
end)

RegisterServerEvent("qb-slots:PayOutRewards")
AddEventHandler("qb-slots:PayOutRewards", function(amount)
    local src   = source
    local PlayerData = QBCore.Players[src].PlayerData
	local Player = QBCore.Functions.GetPlayer(source)
    if PlayerData then
        amount = tonumber(amount)
        if amount > 0 then
            Player.Functions.AddMoney('cash', amount)
			QBCore.Functions.Notify("You won $"..amount.." not bad at all!", "error")
        else
			QBCore.Functions.Notify("Unlucky, maybe next time.", "error")
        end
    end
end)
