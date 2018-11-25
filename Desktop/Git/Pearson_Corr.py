#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Nov 17 23:39:28 2018

@author: swat
"""

import scipy

positive = [[10,90,40],[75,40,0],[10,80,50]]
negative = [[80,20,25],[20,75,88],[70,23,23]]
neutral = [[10,30,80],[70,90,10],[10,30,70]]
#positive = [[10,90,40],[10,90,40],[10,90,40]]
#negative = [[80,20,25],[20,75,88],[70,23,23]]
#neutral = [[10,30,80],[70,90,10],[10,30,70]]

mean_rat_positive=[0,0,0]
a=0
for i in range(0,3):
    a=0
    #mean_rat_positive[i]=a
    for j in range(0,3):
        a=positive[j][i]+a
    mean_rat_positive[i]=round((a/3),2)
    #print(mean_rat_positive[i])
positive.append(mean_rat_positive)
mean_rat_negative=[0,0,0]
a=0
for i in range(0,3):
    a=0
    #mean_rat_positive[i]=a
    for j in range(0,3):
        a=negative[j][i]+a
    mean_rat_negative[i]=round((a/3),2)
    #print(mean_rat_negative[i])
negative.append(mean_rat_negative)
#print(mean_rat_negative)
mean_rat_neutral=[0,0,0]
a=0
for i in range(0,3):
    a=0
    #mean_rat_positive[i]=a
    for j in range(0,3):
        a=neutral[j][i]+a
    mean_rat_neutral[i]=round((a/3),2)
    #print(mean_rat_neutral[i])
neutral.append(mean_rat_neutral)

from scipy.stats import pearsonr
positive_corr=[]

corr, p_value = pearsonr(positive[0], positive[1])
positive_corr.append(round(corr,2))
corr, p_value = pearsonr(positive[1], positive[2])
positive_corr.append(round(corr,2))
corr, p_value = pearsonr(positive[0], positive[2])
positive_corr.append(round(corr,2))
corr, p_value = pearsonr(positive[0], positive[3])
positive_corr.append(round(corr,2))
corr, p_value = pearsonr(positive[1], positive[3])
positive_corr.append(round(corr,2))
corr, p_value = pearsonr(positive[2], positive[3])
positive_corr.append(round(corr,2))

#print(positive_corr)

negative_corr=[]

corr, p_value = pearsonr(negative[0], negative[1])
negative_corr.append(round(corr,2))
corr, p_value = pearsonr(negative[1], negative[2])
negative_corr.append(round(corr,2))
corr, p_value = pearsonr(negative[0], negative[2])
negative_corr.append(round(corr,2))
corr, p_value = pearsonr(negative[0], negative[3])
negative_corr.append(round(corr,2))
corr, p_value = pearsonr(negative[1], negative[3])
negative_corr.append(round(corr,2))
corr, p_value = pearsonr(negative[2], negative[3])
negative_corr.append(round(corr,2))

neutral_corr=[]

corr, p_value = pearsonr(neutral[0], neutral[1])
neutral_corr.append(round(corr,2))
corr, p_value = pearsonr(neutral[1], neutral[2])
neutral_corr.append(round(corr,2))
corr, p_value = pearsonr(neutral[0], neutral[2])
neutral_corr.append(round(corr,2))
corr, p_value = pearsonr(neutral[0], neutral[3])
neutral_corr.append(round(corr,2))
corr, p_value = pearsonr(neutral[1], neutral[3])
neutral_corr.append(round(corr,2))
corr, p_value = pearsonr(neutral[2], neutral[3])
neutral_corr.append(round(corr,2))

import numpy

print("Positive Matrix")
print("Rater1 Rater2 Rater3 Mean Rating")
print(numpy.transpose(positive))
        

print ("Correlation: R1XR2 R2XR3 R1XR3 R1XMR R2XMR R3XMR")
print("Correlation: ",positive_corr)

print("Negative Matrix")
print("Rater1 Rater2 Rater3 Mean Rating")
print(numpy.transpose(negative))

print ("Correlation: R1XR2 R2XR3 R1XR3 R1XMR R2XMR R3XMR")
print("Correlation: ",negative_corr)
print("Neutral Matrix")
print("Rater1 Rater2 Rater3 Mean Rating")
print(numpy.transpose(neutral))
print ("Correlation: R1XR2 R2XR3 R1XR3 R1XMR R2XMR R3XMR")
print("Correlation: ",neutral_corr)